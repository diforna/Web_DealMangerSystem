const jwt = require('jsonwebtoken'); // 引入jsonwebtoken库以用于生成和验证JWT令牌

// 中间件函数：验证访问令牌
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // 从请求头中获取authorization字段
  const token = authHeader && authHeader.split(' ')[1]; // 解析出Bearer后的实际JWT令牌

  if (!token) { // 如果没有找到令牌
    return res.status(401).json({ message: '访问令牌不存在' }); // 返回401状态码及错误信息
  }

  // 验证JWT令牌的有效性
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) { // 如果验证过程中发生错误或令牌无效
      return res.status(403).json({ message: '令牌无效' }); // 返回403状态码及错误信息
    }
    req.user = user; // 将解码后的用户信息附加到请求对象上
    next(); // 继续执行下一个中间件函数或路由处理函数
  });
};

// 中间件函数：要求管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') { // 如果当前用户不是管理员角色
    return res.status(403).json({ message: '需要管理员权限' }); // 返回403状态码及错误信息
  }
  next(); // 继续执行下一个中间件函数或路由处理函数
};

// 导出中间件函数，便于在其他模块中引用
module.exports = { authenticateToken, requireAdmin };
