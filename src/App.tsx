import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { setUser, setSession } from './store/slices/authSlice';
// 移除Supabase导入，使用本地认证

// 页面组件
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import PointsHistoryPage from './pages/PointsHistoryPage';
import MerchantDetailsPage from './pages/MerchantDetailsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

// 调试组件
import LoginTest from './debug/LoginTest';
import SimpleLoginPage from './pages/SimpleLoginPage';

// 布局组件
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, session } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 从localStorage恢复用户会话
    const savedUser = localStorage.getItem('current_user');
    const savedSession = localStorage.getItem('current_session');
    
    if (savedUser && savedSession) {
      try {
        const user = JSON.parse(savedUser);
        const session = JSON.parse(savedSession);
        dispatch(setUser(user));
        dispatch(setSession(session));
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('current_user');
        localStorage.removeItem('current_session');
      }
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/debug" element={<LoginTest />} />
        <Route path="/simple-login" element={<SimpleLoginPage />} />
        
        {/* 受保护的路由 */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/payment-methods" element={<PaymentMethodsPage />} />
                  <Route path="/points-history" element={<PointsHistoryPage />} />
                  <Route path="/merchant/:id" element={<MerchantDetailsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
