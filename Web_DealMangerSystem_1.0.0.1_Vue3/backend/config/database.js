const mysql = require('mysql2/promise'); // 引入mysql2/promise库以支持Promise风格的数据库操作
const bcrypt = require('bcryptjs'); // 引入bcryptjs库以进行密码的哈希处理
require('dotenv').config(); // 加载.env文件中的环境变量配置

// 创建数据库连接池函数
const createPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // 数据库主机地址，默认为localhost
    user: process.env.DB_USER || 'root', // 数据库用户名，默认为root
    password: process.env.DB_PASSWORD || '', // 数据库密码，默认为空
    database: process.env.DB_NAME || 'protocol_management', // 数据库名称，默认为protocol_management
    waitForConnections: true, // 当连接池没有可用连接时，是否等待
    connectionLimit: 10, // 连接池中最大连接数
    queueLimit: 0 // 连接池中最大等待连接请求的数量，0表示没有限制
  });
};

// 初始化数据库连接池
const pool = createPool();

// 初始化数据库表结构
const initDatabase = async () => {
  try {
    // 创建用户表（如果不存在）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY, // 用户ID，自增主键
        username VARCHAR(50) UNIQUE NOT NULL, // 用户名，唯一且不能为空
        password VARCHAR(255) NOT NULL, // 密码，不能为空，长度为255以支持哈希后的密码存储
        email VARCHAR(100), // 邮箱地址
        role ENUM('admin', 'user') DEFAULT 'user', // 用户角色，默认为user，可选admin或user
        created_at TIMESTAMP TIMESTAMP CURRENT_TIMESTAMP // 记录创建时间，默认为当前时间
      )
    `);

    // 创建协议表（如果不存在）
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS protocols (
        id INT AUTO_INCREMENT PRIMARY KEY, // 协议ID，自增主键
        product_category VARCHAR(100) NOT NULL, // 产品类别，不能为空
        function_description TEXT NOT NULL, // 功能描述，不能为空
        transmission_direction VARCHAR(50) NOT NULL, // 传输方向，不能为空
        frame_header VARCHAR(50) NOT NULL, // 帧头，不能为空
        control_word VARCHAR(50) NOT NULL, // 控制字，不能为空
        command_word VARCHAR(50) NOT NULL, // 命令字，不能为空
        length_identification VARCHAR(50) NOT NULL, // 长度标识，不能为空
        data TEXT NOT NULL, // 数据，不能为空
        check_field VARCHAR(50) NOT NULL, // 检查字段，不能为空
        frame_end VARCHAR(50) NOT NULL, // 帧尾，不能为空
        remark TEXT, // 备注
        created_by INT, // 创建者用户ID，外键关联users表的id字段
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, // 记录创建时间，默认为当前时间
        FOREIGN KEY (created_by) REFERENCES users(id), // 外键约束，确保created_by字段引用users表中存在的id
        UNIQUE KEY unique_protocol ( // 唯一约束，确保以下字段组合在表中唯一
          product_category, frame_header, control_word, command_word,
          length_identification, check_field, frame_end
        )
      )
    `);

    // 检查是否存在默认管理员用户
    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) { // 如果不存在管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10); // 对默认密码进行哈希处理
      // 插入默认管理员用户数据
      await pool.execute(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@example.com', 'admin']
      );
      console.log('默认管理员用户已创建: admin/admin123'); // 输出创建信息
    }

    console.log('数据库初始化完成'); // 输出数据库初始化完成信息
  } catch (error) {
    console.error('数据库初始化失败:', error); // 捕获并输出初始化过程中可能出现的错误信息
  }
};

// 执行数据库初始化函数
initDatabase();

// 导出数据库连接池对象，以便在其他模块中使用
module.exports = pool;
