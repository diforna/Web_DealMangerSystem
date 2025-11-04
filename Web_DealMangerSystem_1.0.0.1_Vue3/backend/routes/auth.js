const express = require('express'); // 引入express库以创建路由
const bcrypt = require('bcryptjs'); // 引入bcryptjs库以进行密码的哈希和比较处理
const jwt = require('jsonwebtoken'); // 引入jsonwebtoken库以生成JWT令牌
const db = require('../config/database'); // 引入数据库连接池配置

const router = express.Router(); // 创建一个express路由器实例

// 用户登录路由
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body; // 从请求体中提取用户名和密码

    if (!username || !password) { // 如果用户名或密码为空
      return res.status(400).json({ message: '用户名和密码不能为空' }); // 返回400状态码及错误信息
    }

    // 使用数据库连接池查询用户信息
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) { // 如果未找到匹配的用户名
      return res.status(401).json({ message: '用户名或密码错误' }); // 返回401状态码及错误信息
    }

    const user = users[0]; // 获取查询到的用户信息
    const isValidPassword = await bcrypt.compare(password, user.password); // 比较请求中的密码与数据库中的哈希密码

    if (!isValidPassword) { // 如果密码不匹配
      return res.status(401).json({ message: '用户名或密码错误' }); // 返回401状态码及错误信息
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, // 令牌中包含的用户信息
      process.env.JWT_SECRET || 'your-secret-key', // 使用环境变量中的JWT密钥，如果未设置则使用默认值
      { expiresIn: '24h' } // 令牌过期时间为24小时
    );

    // 返回登录成功信息、生成的令牌及用户部分信息
    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error); // 捕获并输出登录过程中可能出现的错误信息
    res.status(500).json({ message: '服务器内部错误' }); // 返回500状态码及错误信息
  }
});

// 导出路由器实例，便于在其他模块中引用
module.exports = router;
