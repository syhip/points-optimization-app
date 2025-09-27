import React, { useState } from 'react';
import database from '../database/browser-db';

const LoginTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('开始测试登录...');
      console.log('邮箱:', email);
      console.log('密码:', password);
      
      // 首先检查数据库是否已初始化
      const isInitialized = localStorage.getItem('app_db_initialized');
      console.log('数据库是否已初始化:', isInitialized);
      
      if (!isInitialized) {
        console.log('正在初始化数据库...');
        await database.initializeDatabase();
        console.log('数据库初始化完成');
      }
      
      // 检查用户数据
      const users = JSON.parse(localStorage.getItem('app_db_users') || '[]');
      console.log('数据库中的用户:', users);
      
      // 尝试登录
      const loginResult = await database.signIn(email, password);
      console.log('登录成功:', loginResult);
      
      setResult(`登录成功！用户: ${loginResult.user.name} (${loginResult.user.email})`);
    } catch (error) {
      console.error('登录失败:', error);
      setResult(`登录失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDatabase = () => {
    const isInitialized = localStorage.getItem('app_db_initialized');
    const users = JSON.parse(localStorage.getItem('app_db_users') || '[]');
    const paymentMethods = JSON.parse(localStorage.getItem('app_db_payment_methods') || '[]');
    
    console.log('数据库状态:');
    console.log('- 已初始化:', isInitialized);
    console.log('- 用户数量:', users.length);
    console.log('- 支付方式数量:', paymentMethods.length);
    console.log('- 用户列表:', users);
    
    setResult(`数据库状态: 初始化=${isInitialized}, 用户数=${users.length}, 支付方式数=${paymentMethods.length}`);
  };

  const resetDatabase = () => {
    localStorage.clear();
    setResult('数据库已重置，请刷新页面');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">登录测试工具</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试登录'}
          </button>
          
          <button
            onClick={checkDatabase}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            检查数据库
          </button>
          
          <button
            onClick={resetDatabase}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            重置数据库
          </button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded-md">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginTest;