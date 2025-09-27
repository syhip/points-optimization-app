import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { fetchNearbyMerchants, fetchRecommendations } from '../store/slices/merchantsSlice';
import { fetchUserPaymentMethods } from '../store/slices/paymentMethodsSlice';
import { fetchPointsStats } from '../store/slices/pointsSlice';
import {
  MapPin,
  CreditCard,
  TrendingUp,
  Star,
  Navigation,
  Plus,
  Gift,
  Target,
} from 'lucide-react';

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { nearbyMerchants, recommendations, loading: merchantsLoading } = useSelector(
    (state: RootState) => state.merchants
  );
  const { userMethods: userPaymentMethods, loading: paymentLoading } = useSelector(
    (state: RootState) => state.paymentMethods
  );
  const { stats, loading: pointsLoading } = useSelector(
    (state: RootState) => state.points
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 获取用户位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          // 获取附近商家
          dispatch(fetchNearbyMerchants({ latitude: location.lat, longitude: location.lng }));
        },
        (error) => {
          setLocationError('无法获取位置信息，请检查位置权限设置');
          console.error('位置获取失败:', error);
        }
      );
    } else {
      setLocationError('您的浏览器不支持位置服务');
    }

    // 获取用户数据
    dispatch(fetchUserPaymentMethods(user.id));
    dispatch(fetchPointsStats(user.id));
  }, [dispatch]);

  useEffect(() => {
    // 当有位置和用户信息时，获取推荐
    if (userLocation && user?.id) {
      dispatch(fetchRecommendations({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        userId: user.id
      }));
    }
  }, [dispatch, userLocation, user]);

  const handleRefreshLocation = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          dispatch(fetchNearbyMerchants({ latitude: location.lat, longitude: location.lng }));
        },
        (error) => {
          setLocationError('无法获取位置信息，请检查位置权限设置');
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          欢迎回来，{user?.user_metadata?.full_name || user?.email?.split('@')[0]}！
        </h1>
        <p className="text-blue-100">
          让我们帮您找到最优的支付方式，最大化您的积分收益
        </p>
      </div>

      {/* 积分统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">总积分</p>
              <p className="text-2xl font-bold text-gray-900">
                {pointsLoading ? '...' : (stats?.totalPoints || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">本月获得</p>
              <p className="text-2xl font-bold text-gray-900">
                {pointsLoading ? '...' : (stats?.monthlyPoints || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">平均倍率</p>
              <p className="text-2xl font-bold text-gray-900">
                {pointsLoading ? '...' : `${(stats?.averageMultiplier || 0).toFixed(1)}x`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 位置和推荐 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 推荐支付方式 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">推荐支付方式</h2>
              {userLocation && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  当前位置
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {locationError ? (
              <div className="text-center py-8">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{locationError}</p>
                <button
                  onClick={handleRefreshLocation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  重新获取位置
                </button>
              </div>
            ) : merchantsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{rec.payment_method_name}</p>
                        <p className="text-sm text-gray-500">{rec.merchant_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{rec.point_rate}x</p>
                      <p className="text-xs text-gray-500">积分倍率</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : userPaymentMethods && userPaymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">请先添加支付方式</p>
                <Link
                  to="/payment-methods"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加支付方式
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无推荐，请确保位置服务已开启</p>
              </div>
            )}
          </div>
        </div>

        {/* 附近商家 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">附近商家</h2>
          </div>
          
          <div className="p-6">
            {merchantsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : nearbyMerchants && nearbyMerchants.length > 0 ? (
              <div className="space-y-4">
                {nearbyMerchants.slice(0, 4).map((merchant) => (
                  <Link
                    key={merchant.id}
                    to={`/merchant/${merchant.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{merchant.name}</p>
                        <p className="text-sm text-gray-500">{merchant.category}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            距离未知
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">N/A</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无附近商家信息</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/payment-methods"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <CreditCard className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">支付方式</span>
          </Link>
          
          <Link
            to="/points-history"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">积分历史</span>
          </Link>
          
          <Link
            to="/settings"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Target className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">设置</span>
          </Link>
          
          <Link
            to="/profile"
            className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Gift className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">个人资料</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;