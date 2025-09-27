// 测试浏览器登录功能
const bcrypt = require('bcryptjs');

// 模拟localStorage
const mockLocalStorage = {
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

// 模拟BrowserDatabase类
class TestBrowserDatabase {
  constructor() {
    this.localStorage = mockLocalStorage;
  }

  async initializeDatabase() {
    console.log('初始化数据库...');
    
    // 创建测试用户
    const testUsers = [
      {
        id: '1',
        email: 'test@example.com',
        name: '测试用户',
        password: await bcrypt.hash('123456', 10),
        created_at: new Date().toISOString()
      },
      {
        id: '2', 
        email: 'demo@example.com',
        name: '演示用户',
        password: await bcrypt.hash('demo123', 10),
        created_at: new Date().toISOString()
      }
    ];
    
    this.localStorage.setItem('app_db_users', JSON.stringify(testUsers));
    console.log('用户数据已初始化:', testUsers.map(u => ({ email: u.email, name: u.name })));
  }

  async signIn(email, password) {
    console.log(`尝试登录: ${email}`);
    
    // 获取用户数据
    const usersData = this.localStorage.getItem('app_db_users');
    if (!usersData) {
      throw new Error('用户数据未初始化');
    }
    
    const users = JSON.parse(usersData);
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('用户不存在');
    }
    
    console.log('找到用户:', { email: user.email, name: user.name });
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      throw new Error('密码错误');
    }
    
    // 创建会话
    const session = {
      id: 'session_' + Date.now(),
      user_id: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24小时后过期
    };
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      session
    };
  }
}

// 测试登录流程
async function testLoginFlow() {
  console.log('=== 开始测试登录流程 ===');
  
  const db = new TestBrowserDatabase();
  
  try {
    // 1. 初始化数据库
    await db.initializeDatabase();
    console.log('✅ 数据库初始化成功');
    
    // 2. 测试正确的登录
    console.log('\n--- 测试正确登录 ---');
    const loginResult = await db.signIn('test@example.com', '123456');
    console.log('✅ 登录成功:', {
      user: loginResult.user,
      sessionId: loginResult.session.id
    });
    
    // 3. 测试错误的密码
    console.log('\n--- 测试错误密码 ---');
    try {
      await db.signIn('test@example.com', 'wrongpassword');
      console.log('❌ 应该登录失败但却成功了');
    } catch (error) {
      console.log('✅ 正确拒绝了错误密码:', error.message);
    }
    
    // 4. 测试不存在的用户
    console.log('\n--- 测试不存在的用户 ---');
    try {
      await db.signIn('nonexistent@example.com', '123456');
      console.log('❌ 应该登录失败但却成功了');
    } catch (error) {
      console.log('✅ 正确拒绝了不存在的用户:', error.message);
    }
    
    console.log('\n=== 所有测试通过！ ===');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testLoginFlow();