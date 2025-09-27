import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchPointsHistory,
  fetchPointsStats,
  fetchMonthlyTrend,
} from '../store/slices/pointsSlice';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  CreditCard,
  Store,
  Gift,
  BarChart3,
} from 'lucide-react';

const PointsHistoryPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showStats, setShowStats] = useState(true);
  
  const {
    history,
    stats,
    monthlyTrends,
    loading,
    error,
  } = useSelector((state: RootState) => state.points);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchPointsHistory({ userId: user.id }));
      dispatch(fetchPointsStats(user.id));
      dispatch(fetchMonthlyTrend(user.id));
    }
  }, [dispatch, user?.id]);

  const filteredHistory = history.filter((record) => {
    const periodMatch = selectedPeriod === 'all' || 
      (selectedPeriod === 'month' && 
        new Date(record.transaction_date).getMonth() === new Date().getMonth()) ||
      (selectedPeriod === 'week' && 
        new Date(record.transaction_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    const typeMatch = selectedType === 'all' || record.transaction_type === selectedType;
    
    return periodMatch && typeMatch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'redeem':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'bonus':
        return <Gift className="h-5 w-5 text-purple-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'earn':
        return '获得积分';
      case 'redeem':
        return '兑换消费';
      case 'bonus':
        return '奖励积分';
      default:
        return '其他';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">积分历史</h1>
          <p className="text-gray-600">查看您的积分获得和使用记录</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showStats ? '隐藏' : '显示'}统计
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            导出
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 统计卡片 */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPoints?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月获得</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.monthlyPoints?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均倍率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageMultiplier?.toFixed(1) || 0}x
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">交易次数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {history?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">筛选：</span>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">全部时间</option>
            <option value="month">本月</option>
            <option value="week">本周</option>
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">全部类型</option>
            <option value="earn">获得积分</option>
            <option value="redeem">兑换消费</option>
            <option value="bonus">奖励积分</option>
          </select>
          
          <div className="text-sm text-gray-500">
            共 {filteredHistory?.length || 0} 条记录
          </div>
        </div>
      </div>

      {/* 积分历史列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">交易记录</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <div className="space-y-4">
              {filteredHistory?.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-gray-100 rounded-lg mr-4">
                      {getTransactionIcon(record.transaction_type)}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 mr-2">
                          {getTransactionTypeText(record.transaction_type)}
                        </h3>

                      </div>
                      <p className="text-sm text-gray-500">
                        {record.merchant?.name && (
                          <span className="mr-2">{record.merchant.name}</span>
                        )}
                        {record.payment_method?.name && (
                          <span className="mr-2">• {record.payment_method.name}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(record.transaction_date)}
                      </p>
                      {record.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {record.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      record.transaction_type === 'earn' || record.transaction_type === 'bonus'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {record.transaction_type === 'earn' || record.transaction_type === 'bonus' ? '+' : '-'}
                      {record.points_earned.toLocaleString()}
                    </p>
                    {record.amount && (
                      <p className="text-sm text-gray-500">
                        ¥{record.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">暂无积分记录</p>
              <p className="text-sm text-gray-400">
                开始使用支付方式获得积分吧！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 月度趋势图（简化版） */}
      {showStats && monthlyTrends && monthlyTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">月度积分趋势</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {monthlyTrends?.slice(-6).map((trend, index) => (
                <div key={index} className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div
                      className="w-8 bg-blue-500 rounded-t"
                      style={{
                        height: `${Math.max((trend.totalPoints / Math.max(...(monthlyTrends?.map(t => t.totalPoints) || [1]))) * 80, 4)}px`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {trend.month}月
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {trend.totalPoints.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsHistoryPage;