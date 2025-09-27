// 浏览器兼容的数据库工具类
// 使用localStorage模拟SQLite数据库操作

import bcrypt from 'bcryptjs';

// 数据库类型定义
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  password_hash: string;
  plan: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon_url?: string;
  is_active: number;
  created_at: string;
}

export interface UserPaymentMethod {
  id: string;
  user_id: string;
  payment_method_id: string;
  account_info: string;
  is_enabled: number;
  created_at: string;
}

export interface Merchant {
  id: string;
  name: string;
  category?: string;
  latitude: number;
  longitude: number;
  address?: string;
  chain_name?: string;
  created_at: string;
}

export interface PointRule {
  id: string;
  merchant_id: string;
  payment_method_id: string;
  point_rate: number;
  min_amount: number;
  promotion_type?: string;
  valid_from: string;
  valid_to?: string;
  created_at: string;
}

export interface PointHistory {
  id: string;
  user_id: string;
  merchant_id?: string;
  payment_method_id?: string;
  amount: number;
  points_earned: number;
  transaction_date: string;
  transaction_type: 'earn' | 'redeem' | 'bonus' | 'expire';
  description?: string;
}

export interface Recommendation {
  merchant_id: string;
  merchant_name: string;
  payment_method_id: string;
  payment_method_name: string;
  point_rate: number;
  estimated_points: number;
  distance?: number;
}

class BrowserDatabase {
  private getStorageKey(table: string): string {
    return `app_db_${table}`;
  }

  private getTable<T>(tableName: string): T[] {
    const key = this.getStorageKey(tableName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setTable<T>(tableName: string, data: T[]): void {
    const key = this.getStorageKey(tableName);
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  // 初始化数据库
  async initializeDatabase(): Promise<void> {
    // 检查是否已经初始化
    if (localStorage.getItem('app_db_initialized')) {
      return;
    }

    // 初始化支付方式
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'pay001',
        name: 'Pay',
        type: 'mobile_payment',
        icon_url: 'https://example.com/pay-icon.png',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'aupay001',
        name: 'AuPay',
        type: 'mobile_payment',
        icon_url: 'https://example.com/aupay-icon.png',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'rakuten001',
        name: '乐天Pay',
        type: 'mobile_payment',
        icon_url: 'https://example.com/rakuten-pay-icon.png',
        is_active: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'mpay001',
        name: 'MPay',
        type: 'mobile_payment',
        icon_url: 'https://example.com/mpay-icon.png',
        is_active: 1,
        created_at: new Date().toISOString()
      }
    ];
    this.setTable('payment_methods', paymentMethods);

    // 初始化商家
    const merchants: Merchant[] = [
      {
        id: 'merchant001',
        name: '7-Eleven 新宿店',
        category: 'convenience_store',
        latitude: 35.6895,
        longitude: 139.7006,
        address: '东京都新宿区',
        chain_name: '7-Eleven',
        created_at: new Date().toISOString()
      },
      {
        id: 'merchant002',
        name: '全家便利店 涩谷店',
        category: 'convenience_store',
        latitude: 35.6598,
        longitude: 139.7006,
        address: '东京都涩谷区',
        chain_name: 'FamilyMart',
        created_at: new Date().toISOString()
      },
      {
        id: 'merchant003',
        name: '罗森便利店 银座店',
        category: 'convenience_store',
        latitude: 35.6762,
        longitude: 139.7653,
        address: '东京都中央区银座',
        chain_name: 'Lawson',
        created_at: new Date().toISOString()
      },
      {
        id: 'merchant004',
        name: '7-Eleven 原宿店',
        category: 'convenience_store',
        latitude: 35.6702,
        longitude: 139.7016,
        address: '东京都涩谷区原宿',
        chain_name: '7-Eleven',
        created_at: new Date().toISOString()
      },
      {
        id: 'merchant005',
        name: '全家便利店 表参道店',
        category: 'convenience_store',
        latitude: 35.6654,
        longitude: 139.7101,
        address: '东京都港区表参道',
        chain_name: 'FamilyMart',
        created_at: new Date().toISOString()
      }
    ];
    this.setTable('merchants', merchants);

    // 初始化积分规则
    const pointRules: PointRule[] = [
      // 7-Eleven 新宿店
      { id: this.generateId(), merchant_id: 'merchant001', payment_method_id: 'pay001', point_rate: 2.0, min_amount: 100, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant001', payment_method_id: 'aupay001', point_rate: 1.5, min_amount: 100, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant001', payment_method_id: 'rakuten001', point_rate: 3.0, min_amount: 200, promotion_type: 'promotion', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant001', payment_method_id: 'mpay001', point_rate: 1.0, min_amount: 100, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      // 全家便利店 涩谷店
      { id: this.generateId(), merchant_id: 'merchant002', payment_method_id: 'pay001', point_rate: 1.5, min_amount: 100, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant002', payment_method_id: 'aupay001', point_rate: 2.5, min_amount: 100, promotion_type: 'promotion', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant002', payment_method_id: 'rakuten001', point_rate: 2.0, min_amount: 150, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: this.generateId(), merchant_id: 'merchant002', payment_method_id: 'mpay001', point_rate: 1.2, min_amount: 100, promotion_type: 'standard', valid_from: new Date().toISOString(), created_at: new Date().toISOString() },
    ];
    this.setTable('point_rules', pointRules);

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    const users: User[] = [
      {
        id: 'test-user-1',
        email: 'test@example.com',
        phone: '13800138000',
        name: '测试用户',
        password_hash: hashedPassword,
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-user-2',
        email: 'demo@example.com',
        phone: '13800138001',
        name: '演示用户',
        password_hash: hashedPassword,
        plan: 'premium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    this.setTable('users', users);

    // 为测试用户添加支付方式
    const userPaymentMethods: UserPaymentMethod[] = [
      {
        id: 'upm-1',
        user_id: 'test-user-1',
        payment_method_id: 'pay001',
        account_info: JSON.stringify({ account: 'test@pay.com' }),
        is_enabled: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'upm-2',
        user_id: 'test-user-1',
        payment_method_id: 'aupay001',
        account_info: JSON.stringify({ account: 'test_aupay' }),
        is_enabled: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'upm-3',
        user_id: 'test-user-2',
        payment_method_id: 'pay001',
        account_info: JSON.stringify({ account: 'demo@pay.com' }),
        is_enabled: 1,
        created_at: new Date().toISOString()
      }
    ];
    this.setTable('user_payment_methods', userPaymentMethods);

    // 添加积分历史
    const pointHistory: PointHistory[] = [
      {
        id: 'ph-1',
        user_id: 'test-user-1',
        merchant_id: 'merchant001',
        payment_method_id: 'pay001',
        amount: 45.00,
        points_earned: 90,
        transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'earn',
        description: '便利店购物'
      },
      {
        id: 'ph-2',
        user_id: 'test-user-1',
        merchant_id: 'merchant002',
        payment_method_id: 'aupay001',
        amount: 32.50,
        points_earned: 65,
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'earn',
        description: '日用品购买'
      },
      {
        id: 'ph-3',
        user_id: 'test-user-1',
        merchant_id: 'merchant003',
        payment_method_id: 'pay001',
        amount: 28.00,
        points_earned: 84,
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        transaction_type: 'earn',
        description: '早餐购买'
      }
    ];
    this.setTable('point_history', pointHistory);

    // 标记为已初始化
    localStorage.setItem('app_db_initialized', 'true');
  }

  // 用户认证
  async signUp(email: string, password: string, phone: string, name: string): Promise<{ user: User; session: any }> {
    const users = this.getTable<User>('users');
    
    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      throw new Error('用户已存在');
    }

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: this.generateId(),
      email,
      phone,
      name,
      password_hash: hashedPassword,
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);
    this.setTable('users', users);

    // 创建会话
    const session = {
      access_token: `token_${newUser.id}`,
      user: { ...newUser, password_hash: undefined }
    };

    return { user: newUser, session };
  }

  async signIn(email: string, password: string): Promise<{ user: User; session: any }> {
    const users = this.getTable<User>('users');
    
    // 查找用户
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('密码错误');
    }

    // 创建会话
    const session = {
      access_token: `token_${user.id}`,
      user: { ...user, password_hash: undefined }
    };

    return { user, session };
  }

  // 支付方式管理
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.getTable<PaymentMethod>('payment_methods').filter(pm => pm.is_active === 1);
  }

  async getUserPaymentMethods(userId: string): Promise<(UserPaymentMethod & { payment_method: PaymentMethod })[]> {
    const userPaymentMethods = this.getTable<UserPaymentMethod>('user_payment_methods')
      .filter(upm => upm.user_id === userId && upm.is_enabled === 1);
    
    const paymentMethods = this.getTable<PaymentMethod>('payment_methods');
    
    return userPaymentMethods.map(upm => {
      const paymentMethod = paymentMethods.find(pm => pm.id === upm.payment_method_id)!;
      return { ...upm, payment_method: paymentMethod };
    });
  }

  async addUserPaymentMethod(userId: string, paymentMethodId: string, accountInfo: any): Promise<UserPaymentMethod> {
    const userPaymentMethods = this.getTable<UserPaymentMethod>('user_payment_methods');
    
    const newUserPaymentMethod: UserPaymentMethod = {
      id: this.generateId(),
      user_id: userId,
      payment_method_id: paymentMethodId,
      account_info: JSON.stringify(accountInfo),
      is_enabled: 1,
      created_at: new Date().toISOString()
    };

    userPaymentMethods.push(newUserPaymentMethod);
    this.setTable('user_payment_methods', userPaymentMethods);

    return newUserPaymentMethod;
  }

  async removeUserPaymentMethod(userPaymentMethodId: string): Promise<void> {
    const userPaymentMethods = this.getTable<UserPaymentMethod>('user_payment_methods');
    const filteredMethods = userPaymentMethods.filter(upm => upm.id !== userPaymentMethodId);
    this.setTable('user_payment_methods', filteredMethods);
  }

  // 商家管理
  async getNearbyMerchants(latitude: number, longitude: number, radius: number = 5): Promise<Merchant[]> {
    const merchants = this.getTable<Merchant>('merchants');
    
    // 简单的距离计算（实际应用中应使用更精确的地理计算）
    return merchants.filter(merchant => {
      const distance = Math.sqrt(
        Math.pow(merchant.latitude - latitude, 2) + 
        Math.pow(merchant.longitude - longitude, 2)
      ) * 111; // 粗略转换为公里
      return distance <= radius;
    });
  }

  async getMerchantById(merchantId: string): Promise<Merchant | null> {
    const merchants = this.getTable<Merchant>('merchants');
    return merchants.find(m => m.id === merchantId) || null;
  }

  async getMerchantPointRules(merchantId: string): Promise<(PointRule & { payment_method: PaymentMethod })[]> {
    const pointRules = this.getTable<PointRule>('point_rules')
      .filter(pr => pr.merchant_id === merchantId);
    
    const paymentMethods = this.getTable<PaymentMethod>('payment_methods');
    
    return pointRules.map(rule => {
      const paymentMethod = paymentMethods.find(pm => pm.id === rule.payment_method_id)!;
      return { ...rule, payment_method: paymentMethod };
    });
  }

  // 积分管理
  async getPointsHistory(userId: string, limit: number = 50): Promise<(PointHistory & { merchant?: Merchant; payment_method?: PaymentMethod })[]> {
    const pointHistory = this.getTable<PointHistory>('point_history')
      .filter(ph => ph.user_id === userId)
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, limit);
    
    const merchants = this.getTable<Merchant>('merchants');
    const paymentMethods = this.getTable<PaymentMethod>('payment_methods');
    
    return pointHistory.map(ph => {
      const merchant = ph.merchant_id ? merchants.find(m => m.id === ph.merchant_id) : undefined;
      const paymentMethod = ph.payment_method_id ? paymentMethods.find(pm => pm.id === ph.payment_method_id) : undefined;
      return { ...ph, merchant, payment_method: paymentMethod };
    });
  }

  async addPointsRecord(userId: string, merchantId: string, paymentMethodId: string, amount: number, pointsEarned: number, transactionType: 'earn' | 'redeem' | 'bonus' | 'expire' = 'earn', description?: string): Promise<PointHistory> {
    const pointHistory = this.getTable<PointHistory>('point_history');
    
    const newRecord: PointHistory = {
      id: this.generateId(),
      user_id: userId,
      merchant_id: merchantId,
      payment_method_id: paymentMethodId,
      amount,
      points_earned: pointsEarned,
      transaction_date: new Date().toISOString(),
      transaction_type: transactionType,
      description
    };

    pointHistory.push(newRecord);
    this.setTable('point_history', pointHistory);

    return newRecord;
  }

  async getPointsStats(userId: string): Promise<{ totalPoints: number; monthlyPoints: number; transactionCount: number }> {
    const pointHistory = this.getTable<PointHistory>('point_history')
      .filter(ph => ph.user_id === userId);
    
    const totalPoints = pointHistory.reduce((sum, ph) => sum + ph.points_earned, 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPoints = pointHistory
      .filter(ph => {
        const date = new Date(ph.transaction_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, ph) => sum + ph.points_earned, 0);
    
    return {
      totalPoints,
      monthlyPoints,
      transactionCount: pointHistory.length
    };
  }

  async getMonthlyTrend(userId: string): Promise<{ month: string; points: number }[]> {
    const pointHistory = this.getTable<PointHistory>('point_history')
      .filter(ph => ph.user_id === userId);
    
    const monthlyData: { [key: string]: number } = {};
    
    pointHistory.forEach(ph => {
      const date = new Date(ph.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + ph.points_earned;
    });
    
    return Object.entries(monthlyData)
      .map(([month, points]) => ({ month, points }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // 最近6个月
  }

  // 推荐算法
  async getRecommendations(userId: string, latitude: number, longitude: number): Promise<Recommendation[]> {
    const userPaymentMethods = await this.getUserPaymentMethods(userId);
    const nearbyMerchants = await this.getNearbyMerchants(latitude, longitude);
    
    const recommendations: Recommendation[] = [];
    
    for (const merchant of nearbyMerchants) {
      const pointRules = await this.getMerchantPointRules(merchant.id);
      
      for (const rule of pointRules) {
        const userHasPaymentMethod = userPaymentMethods.some(
          upm => upm.payment_method_id === rule.payment_method_id
        );
        
        if (userHasPaymentMethod) {
          const estimatedAmount = 1000; // 假设消费金额
          const estimatedPoints = estimatedAmount * rule.point_rate / 100;
          
          recommendations.push({
            merchant_id: merchant.id,
            merchant_name: merchant.name,
            payment_method_id: rule.payment_method_id,
            payment_method_name: rule.payment_method.name,
            point_rate: rule.point_rate,
            estimated_points: estimatedPoints,
            distance: Math.sqrt(
              Math.pow(merchant.latitude - latitude, 2) + 
              Math.pow(merchant.longitude - longitude, 2)
            ) * 111
          });
        }
      }
    }
    
    return recommendations
      .sort((a, b) => b.estimated_points - a.estimated_points)
      .slice(0, 10);
  }
}

// 创建单例实例
const browserDatabase = new BrowserDatabase();

// 自动初始化
browserDatabase.initializeDatabase().catch(console.error);

export default browserDatabase;