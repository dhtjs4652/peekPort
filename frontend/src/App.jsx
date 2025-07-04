import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PortfolioManagement from './components/PortfolioManagement';
import PortfolioAnalysis from './components/PortfolioAnalysis';
import Navigation from './components/Navigation';
import PublicNavigation from './components/PublicNavigation';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { isAuthenticated } from './utils/authUtils';
import './App.css';

// 보호된 레이아웃 컴포넌트 - 인증된 사용자만 접근 가능한 레이아웃
const ProtectedLayout = ({ children }) => {
  const [fadeIn, setFadeIn] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // 경로에 따라 currentPage 상태 업데이트
  useEffect(() => {
    let page = 'dashboard';
    if (location.pathname.includes('/portfolio')) {
      page = 'portfolio';
    } else if (location.pathname.includes('/analysis')) {
      page = 'analysis';
    }
    setCurrentPage(page);
  }, [location]);

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setFadeIn(false);

    setTimeout(() => {
      // React Router로 페이지 이동
      if (page === 'dashboard') navigate('/dashboard');
      else if (page === 'portfolio') navigate('/portfolio');
      else if (page === 'analysis') navigate('/analysis');

      setFadeIn(true);
    }, 150);
  };

  // 인증 확인
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />

      {/* 사이드바 공간 확보 (pl-64) + 상단 헤더 공간 확보 (pt-16) */}
      <div className="md:pl-64 pt-16 min-h-screen">
        <div
          className={`max-w-full px-4 md:px-8 py-4 md:py-6 space-y-6 transition-opacity duration-300 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// 공개 레이아웃 컴포넌트 - 모든 사용자가 접근 가능한 레이아웃
const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavigation />
      <main className="flex-grow">{children}</main>
      <footer className="bg-white border-t py-4 text-center text-gray-600 text-sm">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} PeekPort. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

// 인증된 사용자 리다이렉트 컴포넌트
const AuthRedirect = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/dashboard" /> : children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // 로딩 시뮬레이션 + 인증 상태 확인
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAuthChecked(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 로딩 화면
  if (isLoading || !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* 공개 라우트 - 홈페이지 */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />

        {/* 공개 라우트 - 로그인/회원가입 (로그인 상태면 대시보드로 리다이렉트) */}
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            </AuthRedirect>
          }
        />

        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <PublicLayout>
                <SignupPage />
              </PublicLayout>
            </AuthRedirect>
          }
        />

        {/* 보호된 라우트 - 대시보드 등 (로그인 필요) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedLayout>
              <PortfolioManagement />
            </ProtectedLayout>
          }
        />

        <Route
          path="/analysis"
          element={
            <ProtectedLayout>
              <PortfolioAnalysis />
            </ProtectedLayout>
          }
        />

        {/* 기본 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
