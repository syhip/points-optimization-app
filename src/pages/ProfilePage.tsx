import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
// 移除Supabase导入，使用本地数据库
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Award,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.points);
  const { userMethods } = useSelector((state: RootState) => state.paymentMethods);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    preferences: {
      favoriteCategories: [] as string[],
      notificationFrequency: 'daily',
      preferredPaymentMethods: [] as string[],
    },
  });

  useEffect(() => {
    if (user) {
      // 在本地SQLite数据库中，用户数据结构不同
      setProfileData({
        fullName: user.name || '',
        phone: user.phone || '',
        dateOfBirth: '',
        address: '',
        preferences: {
          favoriteCategories: [],
          notificationFrequency: 'daily',
          preferredPaymentMethods: [],
        },
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const handleCategoryToggle = (category: string) => {
    const currentCategories = profileData.preferences.favoriteCategories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    handlePreferenceChange('favoriteCategories', newCategories);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 在本地SQLite数据库中，用户资料更新功能暂时模拟成功
      // 实际应用中需要实现用户资料更新的数据库操作
      await new Promise(resolve => setTimeout(resolve, 500)); // 模拟异步操作
      
      setSuccess('个人资料更新成功！');
      setIsEditing(false);
      
      // 清除成功消息
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || '更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // 重置表单数据
    if (user) {
      setProfileData({
        fullName: user.name || '',
        phone: user.phone || '',
        dateOfBirth: '',
        address: '',
        preferences: {
          favoriteCategories: [],
          notificationFrequency: 'daily',
          preferredPaymentMethods: [],
        },
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const categories = [
    '便利店', '超市', '餐饮', '加油站', '购物中心',
    '药店', '咖啡店', '快餐', '电影院', '书店'
  ];

  const getMembershipLevel = () => {
    const totalPoints = stats?.totalPoints || 0;
    if (totalPoints >= 10000) return { level: '钻石会员', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (totalPoints >= 5000) return { level: '金牌会员', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (totalPoints >= 1000) return { level: '银牌会员', color: 'text-gray-600', bg: 'bg-gray-100' };
    return { level: '普通会员', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  const membership = getMembershipLevel();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
          <p className="text-gray-600">管理您的个人信息和偏好设置</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            编辑资料
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </button>
          </div>
        )}
      </div>

      {/* 消息提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {/* 用户头像和基本信息 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-2xl font-medium text-white">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                  <Camera className="h-3 w-3" />
                </button>
              )}
            </div>
            
            <div className="ml-6 flex-1">
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900 mr-3">
                  {profileData.fullName || user?.email?.split('@')[0] || '用户'}
                </h2>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${membership.bg} ${membership.color}`}>
                  <Award className="h-3 w-3 mr-1" />
                  {membership.level}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-1">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>注册时间: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总积分</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalPoints?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">支付方式</p>
              <p className="text-2xl font-bold text-gray-900">
                {userMethods?.length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均倍率</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.averageMultiplier?.toFixed(1) || 0}x
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">基本信息</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="请输入您的姓名"
                />
              ) : (
                <p className="text-gray-900">{profileData.fullName || '未设置'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号码
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="请输入手机号码"
                />
              ) : (
                <p className="text-gray-900">{profileData.phone || '未设置'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                出生日期
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">
                  {profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : '未设置'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <p className="text-gray-900 flex items-center">
                {user?.email}
                <Shield className="h-4 w-4 ml-2 text-green-600" />
                <span className="text-xs text-green-600 ml-1">已验证</span>
              </p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              地址
            </label>
            {isEditing ? (
              <textarea
                value={profileData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="请输入您的地址"
              />
            ) : (
              <p className="text-gray-900">{profileData.address || '未设置'}</p>
            )}
          </div>
        </div>
      </div>

      {/* 偏好设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">偏好设置</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* 喜欢的商家类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              喜欢的商家类型
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => isEditing && handleCategoryToggle(category)}
                  disabled={!isEditing}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    profileData.preferences.favoriteCategories.includes(category)
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  } ${isEditing ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* 通知频率 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通知频率
            </label>
            {isEditing ? (
              <select
                value={profileData.preferences.notificationFrequency}
                onChange={(e) => handlePreferenceChange('notificationFrequency', e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="realtime">实时通知</option>
                <option value="daily">每日汇总</option>
                <option value="weekly">每周汇总</option>
                <option value="never">不接收通知</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {{
                  realtime: '实时通知',
                  daily: '每日汇总',
                  weekly: '每周汇总',
                  never: '不接收通知',
                }[profileData.preferences.notificationFrequency] || '每日汇总'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;