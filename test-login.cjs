// 简单的登录测试脚本
const bcrypt = require('bcryptjs');

// 模拟浏览器localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// 模拟数据库类
class TestDatabase {
  getStorageKey(table) {
    return `app_db_${table}`;
  }

  getTable(tableName) {
    const key = this.getStorageKey(tableName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  setTable(tableName, data) {
    const key = this.getStorageKey(tableName);
    localStorage.setItem(key, JSON.stringify(data));
  }

  generateId() {
    return Math.random().toString(36).substr(2, 16);
  }

  async initializeDatabase() {
    if (localStorage.getItem('app_db_initialized')) {
      console.log('数据库已初始化');
      return;
    }

    console.log('正在初始化数据库...');
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users = [
      {
        id: 'test-user-1',
        email: 'test@example.com',
        phone: '13800138000',
        name: '测试用户',
        password_hash: hashedPassword,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.setTable('users', users);
    localStorage.setItem('app_db_initialized', 'true');
    console.log('数据库初始化完成');
    console.log('创建的用户:', users[0]);
  }

  async signIn(email, password) {
    const users = this.getTable('users');
    console.log('查找用户:', email);
    console.log('数据库中的用户:', users);
    
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('用户不存在');
    }

    console.log('找到用户:', user);
    console.log('验证密码...');
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      throw new Error('密码错误');
    }

    const session = {
      access_token: `token_${user.id}`,
      user: { ...user, password_hash: undefined }
    };

    return { user, session };
  }
}

// 测试函数
async function testLogin() {
  console.log('=== 开始登录测试 ===');
  
  const db = new TestDatabase();
  
  try {
    // 初始化数据库
    await db.initializeDatabase();
    
    // 测试登录
    console.log('\n=== 测试登录 ===');
    const result = await db.signIn('test@example.com', '123456');
    console.log('登录成功!');
    console.log('用户信息:', result.user);
    console.log('会话信息:', result.session);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testLogin();