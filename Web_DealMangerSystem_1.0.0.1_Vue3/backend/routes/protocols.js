const express = require('express'); // 引入express库以创建路由
const db = require('../config/database'); // 引入数据库连接池配置
const { authenticateToken } = require('../middleware/auth'); // 引入认证中间件
const XLSX = require('xlsx'); // 引入xlsx库以处理Excel文件
const router = express.Router(); // 创建一个express路由器实例

// 获取所有协议
router.get('/', authenticateToken, async (req, res) => {
  try {
    // 查询所有协议，并关联创建者用户名
    const [protocols] = await db.execute(`
      SELECT p.*, u.username as created_by_name
      FROM protocols p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(protocols); // 返回协议列表
  } catch (error) {
    console.error('获取协议列表错误:', error); // 捕获并输出错误信息
    res.status(500).json({ message: '获取协议列表失败' }); // 返回500状态码及错误信息
  }
});

// 添加协议
router.post('/', authenticateToken, async (req, res) => {
  try {
    // 从请求体中提取协议字段
    const {
      product_category,
      function_description,
      transmission_direction,
      frame_header,
      control_word,
      command_word,
      length_identification,
      data,
      check_field,
      frame_end,
      remark
    } = req.body;

    // 检查协议是否已存在（排除 data 字段，因为它是 TEXT 类型）
    const [existing] = await db.execute(`
      SELECT id FROM protocols WHERE
      product_category = ? AND frame_header = ? AND control_word = ? AND
      command_word = ? AND length_identification = ? AND
      check_field = ? AND frame_end = ?
    `, [
      product_category, frame_header, control_word, command_word,
      length_identification, check_field, frame_end
    ]);

    if (existing.length > 0) { // 如果协议已存在
      return res.status(400).json({ message: '协议已存在，不能重复添加' }); // 返回400状态码及错误信息
    }

    // 插入新协议
    const [result] = await db.execute(`
      INSERT INTO protocols (
        product_category, function_description, transmission_direction,
        frame_header, control_word, command_word, length_identification,
        data, check_field, frame_end, remark, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      product_category, function_description, transmission_direction,
      frame_header, control_word, command_word, length_identification,
      data, check_field, frame_end, remark, req.user.id
    ]);

    res.status(201).json({ // 返回201状态码及成功信息
      message: '协议添加成功',
      id: result.insertId // 返回新插入协议的ID
    });
  } catch (error) {
    console.error('添加协议错误:', error); // 捕获并输出错误信息
    res.status(500).json({ message: '添加协议失败' }); // 返回500状态码及错误信息
  }
});

// 删除协议
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const protocolId = req.params.id; // 从URL参数中获取协议ID

    // 检查协议是否存在
    const [protocols] = await db.execute('SELECT * FROM protocols WHERE id = ?', [protocolId]);

    if (protocols.length === 0) { // 如果协议不存在
      return res.status(404).json({ message: '协议不存在' }); // 返回404状态码及错误信息
    }

    const protocol = protocols[0]; // 获取协议信息

    // 检查权限：只有管理员或创建者可以删除
    if (req.user.role !== 'admin' && protocol.created_by !== req.user.id) {
      return res.status(403).json({ message: '没有权限删除此协议' }); // 返回403状态码及错误信息
    }

    // 删除协议
    await db.execute('DELETE FROM protocols WHERE id = ?', [protocolId]);

    res.json({ message: '协议删除成功' }); // 返回成功信息
  } catch (error) {
    console.error('删除协议错误:', error); // 捕获并输出错误信息
    res.status(500).json({ message: '删除协议失败' }); // 返回500状态码及错误信息
  }
});

// 导出协议到Excel
router.get('/export', authenticateToken, async (req, res) => {
  try {
    // 查询所有协议
    const [protocols] = await db.execute(`
      SELECT * FROM protocols ORDER BY created_at DESC
    `);

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 准备数据
    const excelData = protocols.map(protocol => ({
      '产品类别': protocol.product_category,
      '功能说明': protocol.function_description,
      '传输方向': protocol.transmission_direction,
      '帧头': protocol.frame_header,
      '控制字': protocol.control_word,
      '命令字': protocol.command_word,
      '长度标识': protocol.length_identification,
      '数据': protocol.data,
      '校验字段': protocol.check_field,
      '帧尾': protocol.frame_end,
      '备注': protocol.remark,
      '创建时间': protocol.created_at
    }));

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '协议数据');

    // 生成Excel文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer'
    });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=protocols.xlsx');

    res.send(excelBuffer); // 发送Excel文件
  } catch (error) {
    console.error('导出协议错误:', error); // 捕获并输出错误信息
    res.status(500).json({ message: '导出协议失败' }); // 返回500状态码及错误信息
  }
});

// 导出路由器实例，便于在其他模块中引用
module.exports = router;
