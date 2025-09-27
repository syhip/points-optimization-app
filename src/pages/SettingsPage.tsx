import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { signOut } from '../store/slices/authSlice';
import {
  Bell,
  MapPin,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Database,
  Eye,
  EyeOff,
} from 'lucide-react';

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [settings, setSettings] = useState({
    notifications: {
      pointsEarned: true,
      promotions: true,
      nearbyOffers: false,
      weeklyReport: true,
    },
    location: {
      autoDetect: true,
      shareLocation: true,
    },
    privacy: {
      dataCollection: true,
      analytics: false,
      marketing: false,
    },
    appearance: {
      darkMode: false,
      language: 'zh-CN',
    },
  });

  const handleSignOut = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await dispatch(signOut());
      navigate('/login');
    }
  };

  const handleSettingChange = (category: string, key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  const SettingItem = ({ 
    icon: Icon, 
    title, 
    description, 
    value, 
    onChange, 
    type = 'toggle' 
  }: {
    icon: any;
    title: string;
    description?: string;
    value?: boolean | string;
    onChange?: (value: any) => void;
    type?: 'toggle' | 'select' | 'button';
  }) => {
    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg mr-3">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{title}</p>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        
        {type === 'toggle' && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onChange?.(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        )}
        
        {type === 'button' && (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-600">管理您的账户和应用偏好设置</p>
      </div>

      {/* 用户信息 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xl font-medium text-white">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">
                {user?.user_metadata?.full_name || '用户'}
              </h2>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-sm text-gray-400">
                注册时间: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">通知设置</h2>
          <p className="text-sm text-gray-600">管理您希望接收的通知类型</p>
        </div>
        
        <div className="divide-y">
          <SettingItem
            icon={Bell}
            title="积分获得通知"
            description="当您获得积分时接收通知"
            value={settings.notifications.pointsEarned}
            onChange={(value) => handleSettingChange('notifications', 'pointsEarned', value)}
          />
          
          <SettingItem
            icon={Bell}
            title="促销活动通知"
            description="接收最新的促销和优惠信息"
            value={settings.notifications.promotions}
            onChange={(value) => handleSettingChange('notifications', 'promotions', value)}
          />
          
          <SettingItem
            icon={MapPin}
            title="附近优惠通知"
            description="当您附近有优惠活动时通知您"
            value={settings.notifications.nearbyOffers}
            onChange={(value) => handleSettingChange('notifications', 'nearbyOffers', value)}
          />
          
          <SettingItem
            icon={Database}
            title="周报通知"
            description="每周发送积分统计报告"
            value={settings.notifications.weeklyReport}
            onChange={(value) => handleSettingChange('notifications', 'weeklyReport', value)}
          />
        </div>
      </div>

      {/* 位置设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">位置设置</h2>
          <p className="text-sm text-gray-600">管理位置相关功能</p>
        </div>
        
        <div className="divide-y">
          <SettingItem
            icon={MapPin}
            title="自动检测位置"
            description="自动获取您的位置以提供附近商家信息"
            value={settings.location.autoDetect}
            onChange={(value) => handleSettingChange('location', 'autoDetect', value)}
          />
          
          <SettingItem
            icon={Globe}
            title="分享位置信息"
            description="允许应用使用您的位置信息提供个性化推荐"
            value={settings.location.shareLocation}
            onChange={(value) => handleSettingChange('location', 'shareLocation', value)}
          />
        </div>
      </div>

      {/* 隐私设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">隐私设置</h2>
          <p className="text-sm text-gray-600">控制数据收集和使用方式</p>
        </div>
        
        <div className="divide-y">
          <SettingItem
            icon={Database}
            title="数据收集"
            description="允许收集使用数据以改善服务"
            value={settings.privacy.dataCollection}
            onChange={(value) => handleSettingChange('privacy', 'dataCollection', value)}
          />
          
          <SettingItem
            icon={Eye}
            title="分析统计"
            description="允许收集匿名使用统计信息"
            value={settings.privacy.analytics}
            onChange={(value) => handleSettingChange('privacy', 'analytics', value)}
          />
          
          <SettingItem
            icon={EyeOff}
            title="营销推广"
            description="允许基于您的偏好发送营销信息"
            value={settings.privacy.marketing}
            onChange={(value) => handleSettingChange('privacy', 'marketing', value)}
          />
        </div>
      </div>

      {/* 外观设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">外观设置</h2>
          <p className="text-sm text-gray-600">自定义应用外观和语言</p>
        </div>
        
        <div className="divide-y">
          <SettingItem
            icon={settings.appearance.darkMode ? Moon : Sun}
            title="深色模式"
            description="切换到深色主题"
            value={settings.appearance.darkMode}
            onChange={(value) => handleSettingChange('appearance', 'darkMode', value)}
          />
          
          <div className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <Globe className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">语言</p>
                <p className="text-sm text-gray-500">选择应用显示语言</p>
              </div>
            </div>
            <select
              value={settings.appearance.language}
              onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
          </div>
        </div>
      </div>

      {/* 其他设置 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">其他</h2>
        </div>
        
        <div className="divide-y">
          <button className="w-full">
            <SettingItem
              icon={HelpCircle}
              title="帮助与支持"
              description="查看常见问题和联系客服"
              type="button"
            />
          </button>
          
          <button className="w-full">
            <SettingItem
              icon={Shield}
              title="隐私政策"
              description="查看我们的隐私政策"
              type="button"
            />
          </button>
          
          <button className="w-full">
            <SettingItem
              icon={Info}
              title="关于应用"
              description="版本信息和更新日志"
              type="button"
            />
          </button>
        </div>
      </div>

      {/* 退出登录 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={handleSignOut}
          className="w-full p-4 flex items-center text-red-600 hover:bg-red-50"
        >
          <div className="p-2 bg-red-100 rounded-lg mr-3">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">退出登录</p>
            <p className="text-sm text-red-500">退出当前账户</p>
          </div>
        </button>
      </div>

      {/* 版本信息 */}
      <div className="text-center text-sm text-gray-500">
        <p>积分优化助手 v1.0.0</p>
        <p>© 2024 All rights reserved</p>
      </div>
    </div>
  );
};

export default SettingsPage;