const express = require('express'); // 引入 Express 框架
const cors = require('cors'); // 引入 cors 中间件以处理跨域请求
const db = require('./config/database'); // 引入数据库配置
require('dotenv').config(); // 加载 .env 文件中的环境变量

// 调试：检查环境变量是否加载
console.log('环境变量检查:');
console.log('DB_HOST:', process.env.DB_HOST); // 输出数据库主机地址
console.log('DB_USER:', process.env.DB_USER); // 输出数据库用户名
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '***未设置***'); // 如果数据库密码已设置，则显示“***已设置***”，否则显示“***未设置***”
console.log('DB_NAME:', process.env.DB_NAME); // 输出数据库名称

const app = express(); // 创建一个 Express 应用实例

// 中间件
app.use(cors()); // 使用 cors 中间件以允许跨域请求
app.use(express.json()); // 使用 express.json() 中间件以解析 JSON 格式的请求体

// 路由
app.use('/api/auth', require('./routes/auth')); // 使用认证相关的路由
app.use('/api/users', require('./routes/users')); // 使用用户管理相关的路由
app.use('/api/protocols', require('./routes/protocols')); // 使用协议相关的路由

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack); // 在控制台记录错误堆栈信息
  res.status(500).json({ message: '服务器内部错误' }); // 返回 500 状态码及错误信息
});

const PORT = process.env.PORT || 5000; // 设置服务器运行的端口号，优先使用环境变量中的端口号，如果未设置则使用 5000

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`); // 当服务器成功启动时，在控制台输出服务器运行的端口号
});
