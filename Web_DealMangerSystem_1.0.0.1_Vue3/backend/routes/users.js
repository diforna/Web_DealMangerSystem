const express = require('express'); // 引入 Express 框架
const bcrypt = require('bcryptjs'); // 引入 bcryptjs 库用于密码哈希
const db = require('../config/database'); // 引入数据库配置
const { authenticateToken, requireAdmin } = require('../middleware/auth'); // 引入身份验证和管理员权限中间件
const router = express.Router(); // 创建一个 Express 路由器实例

// 获取所有用户（仅管理员）
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 执行 SQL 查询以获取所有用户，按创建时间降序排列
    const [users] = await db.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users); // 将用户列表作为 JSON 响应返回
  } catch (error) {
    console.error('获取用户列表错误:', error); // 在控制台记录错误信息
    res.status(500).json({ message: '获取用户列表失败' }); // 返回 500 状态码及错误信息
  }
});

// 创建用户（仅管理员）
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, email, role } = req.body; // 从请求体中解构出用户名、密码、邮箱和角色

    // 检查所有字段是否都有值
    if (!username || !password || !email || !role) {
      return res.status(400).json({ message: '所有字段都是必需的' }); // 如果有字段为空，返回 400 状态码并提示
    }

    // 执行 SQL 查询以检查用户名是否已存在
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '用户名已存在' }); // 如果用户名已存在，返回 400 状态码并提示
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 执行 SQL 插入语句以创建新用户
    await db.execute(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, email, role]
    );

    res.status(201).json({ message: '用户创建成功' }); // 返回 201 状态码表示用户创建成功
  } catch (error) {
    console.error('创建用户错误:', error); // 在控制台记录错误信息
    res.status(500).json({ message: '创建用户失败' }); // 返回 500 状态码及错误信息
  }
});

// 更新用户（仅管理员）
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id; // 从 URL 参数中获取用户 ID
    const { username, email, role, password } = req.body; // 从请求体中解构出用户名、密码、邮箱和角色

    // 执行 SQL 查询以检查指定 ID 的用户是否存在
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' }); // 如果用户不存在，返回 404 状态码并提示
    }

    let updateQuery = 'UPDATE users SET username = ?, email = ?, role = ?'; // 准备更新用户的 SQL 查询
    let queryParams = [username, email, role]; // 设置更新查询的参数

    // 如果请求体中包含了新密码，则对密码进行哈希处理并更新 SQL 查询及参数
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ', password = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?'; // 在 SQL 查询中添加条件，根据用户 ID 更新
    queryParams.push(userId);

    await db.execute(updateQuery, queryParams); // 执行更新操作

    res.json({ message: '用户更新成功' }); // 返回成功消息
  } catch (error) {
    console.error('更新用户错误:', error); // 在控制台记录错误信息
    res.status(500).json({ message: '更新用户失败' }); // 返回 500 状态码及错误信息
  }
});

// 删除用户（仅管理员）
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id; // 从 URL 参数中获取用户 ID

    // 管理员不能删除自己的账户
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: '不能删除自己的账户' }); // 返回 400 状态码并提示
    }

    // 执行 SQL 查询以检查指定 ID 的用户是否存在
    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: '用户不存在' }); // 如果用户不存在，返回 404 状态码并提示
    }

    // 执行 SQL 删除语句以删除指定 ID 的用户
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: '用户删除成功' }); // 返回成功消息
  } catch (error) {
    console.error('删除用户错误:', error); // 在控制台记录错误信息
    res.status(500).json({ message: '删除用户失败' }); // 返回 500 状态码及错误信息
  }
});

module.exports = router; // 导出路由器实例
