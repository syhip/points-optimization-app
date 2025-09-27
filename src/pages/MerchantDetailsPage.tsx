import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchMerchantDetails,
  fetchMerchantPointRules,
  setSelectedMerchant,
} from '../store/slices/merchantsSlice';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  CreditCard,
  TrendingUp,
  Navigation,
  Share,
  Heart,
  Info,
} from 'lucide-react';

const MerchantDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('info');
  
  const {
    selectedMerchant,
    pointRules,
    loading,
    error,
  } = useSelector((state: RootState) => state.merchants);
  
  const { userMethods: userPaymentMethods } = useSelector(
    (state: RootState) => state.paymentMethods
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchMerchantDetails(id));
      dispatch(fetchMerchantPointRules(id));
    }
    
    return () => {
      dispatch(setSelectedMerchant(null));
    };
  }, [dispatch, id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleGetDirections = () => {
    if (selectedMerchant?.latitude && selectedMerchant?.longitude) {
      const url = `https://maps.google.com/maps?daddr=${selectedMerchant.latitude},${selectedMerchant.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share && selectedMerchant) {
      try {
        await navigator.share({
          title: selectedMerchant.name,
          text: `查看 ${selectedMerchant.name} 的积分优惠信息`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const getBestPointRule = () => {
    if (pointRules.length === 0) return null;
    return pointRules.reduce((best, rule) => 
      rule
    );
  };

  const getPaymentMethodName = (paymentMethodId: string) => {
    const userMethod = userPaymentMethods.find(um => um.payment_method_id === paymentMethodId);
    return userMethod ? `我的${userMethod.payment_method?.name || '支付方式'}` : '支付方式';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedMerchant) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          {error || '商家信息加载失败'}
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </button>
      </div>
    );
  }

  const bestRule = getBestPointRule();

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <Share className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 商家基本信息 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* 商家头部信息 */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedMerchant.name}
              </h1>
              
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-4">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">
                    N/A
                  </span>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {selectedMerchant.category}
                </span>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                {selectedMerchant.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{selectedMerchant.address}</span>
                  </div>
                )}
                

                

                

              </div>
            </div>
            
            {/* 最佳积分倍率 */}
            {bestRule && (
              <div className="text-center bg-green-50 rounded-lg p-4 ml-6">
                <div className="text-2xl font-bold text-green-600">
                  积分
                </div>
                <div className="text-sm text-green-700">最高积分倍率</div>
              </div>
            )}
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="px-6 pb-6">
          <div className="flex space-x-3">
            <button
              onClick={handleGetDirections}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Navigation className="h-4 w-4 mr-2" />
              导航
            </button>
            

          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Info className="h-4 w-4 inline mr-2" />
              商家信息
            </button>
            
            <button
              onClick={() => setActiveTab('points')}
              className={`py-4 text-sm font-medium border-b-2 ${
                activeTab === 'points'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              积分规则
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-4">

              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700">商家类型</p>
                    <p className="text-gray-900">{selectedMerchant.category}</p>
                  </div>
                  

                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'points' && (
            <div className="space-y-4">
              {pointRules.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">积分获得规则</h3>
                  <div className="space-y-3">
                    {pointRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getPaymentMethodName(rule.payment_method_id)}
                            </p>
                            <p className="text-sm text-gray-500">
                              积分规则
                            </p>
                            {rule.min_amount && (
                              <p className="text-xs text-gray-400">
                                最低消费：¥{rule.min_amount}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            1x
                          </div>
                          <div className="text-xs text-gray-500">积分倍率</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">暂无积分规则信息</p>
                </div>
              )}
              
              {/* 积分使用说明 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">积分说明</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 积分将在消费后24小时内到账</li>
                  <li>• 不同支付方式的积分倍率可能不同</li>
                  <li>• 积分有效期为获得后12个月</li>
                  <li>• 部分商品可能不参与积分活动</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantDetailsPage;