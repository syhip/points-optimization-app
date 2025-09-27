import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchAvailablePaymentMethods,
  fetchUserPaymentMethods,
  addUserPaymentMethod,
  removeUserPaymentMethod,
} from '../store/slices/paymentMethodsSlice';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Smartphone,
  Wallet,
} from 'lucide-react';

const PaymentMethodsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  
  const {
    availableMethods: availablePaymentMethods,
    userMethods: userPaymentMethods,
    loading,
    error
  } = useSelector((state: RootState) => state.paymentMethods);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAvailablePaymentMethods());
    dispatch(fetchUserPaymentMethods(user.id));
  }, [dispatch]);

  const handleAddPaymentMethod = async () => {
    if (!selectedMethod || !cardNumber.trim()) return;
    
    try {
      await dispatch(addUserPaymentMethod({
        userId: user.id,
        paymentMethodId: selectedMethod,
        accountInfo: { cardNumber: cardNumber.trim() },
      })).unwrap();
      
      // 重置表单
      setSelectedMethod(null);
      setCardNumber('');
      setCardName('');
      setShowAddModal(false);
      
      // 刷新用户支付方式列表
      dispatch(fetchUserPaymentMethods(user.id));
    } catch (error) {
      console.error('添加支付方式失败:', error);
    }
  };

  const handleRemovePaymentMethod = async (userPaymentMethodId: string) => {
    if (window.confirm('确定要删除这个支付方式吗？')) {
      try {
        await dispatch(removeUserPaymentMethod(userPaymentMethodId)).unwrap();
        dispatch(fetchUserPaymentMethods(user.id));
      } catch (error) {
        console.error('删除支付方式失败:', error);
      }
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-6 w-6" />;
      case 'mobile_payment':
        return <Smartphone className="h-6 w-6" />;
      case 'digital_wallet':
        return <Wallet className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const formatCardNumber = (number: string) => {
    // 只显示后4位，其他用*代替
    if (number.length <= 4) return number;
    return '**** **** **** ' + number.slice(-4);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">支付方式管理</h1>
          <p className="text-gray-600">管理您的支付方式，获得更精准的积分推荐</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          添加支付方式
        </button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* 用户支付方式列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">我的支付方式</h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : userPaymentMethods && userPaymentMethods.length > 0 ? (
            <div className="space-y-4">
              {userPaymentMethods?.map((userMethod) => {
                const method = availablePaymentMethods.find(
                  (m) => m.id === userMethod.payment_method_id
                );
                return (
                  <div
                    key={userMethod.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        {getPaymentMethodIcon(method?.type || 'credit_card')}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {method?.name || '未知支付方式'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatCardNumber(JSON.parse(userMethod.account_info || '{}').cardNumber || '')}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-400">
                            添加时间: {new Date(userMethod.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePaymentMethod(userMethod.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="删除支付方式"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">您还没有添加任何支付方式</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加第一个支付方式
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加支付方式模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">添加支付方式</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* 选择支付方式类型 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择支付方式类型
                    </label>
                    <div className="space-y-2">
                      {availablePaymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedMethod === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                              {getPaymentMethodIcon(method.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{method.name}</p>
                              <p className="text-sm text-gray-500">支付方式</p>
                            </div>
                          </div>
                          {selectedMethod === method.id && (
                            <Check className="h-5 w-5 text-blue-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 卡号输入 */}
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                      卡号/账号 *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入卡号或账号"
                    />
                  </div>

                  {/* 卡片名称（可选） */}
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                      卡片名称（可选）
                    </label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例如：工作卡、生活卡"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  disabled={!selectedMethod || !cardNumber.trim() || loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '添加中...' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsPage;