// ProtectedLayout.jsx - 인증된 사용자만 접근 가능한 레이아웃
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';
import Navigation from './Navigation'; // 기존의 내부 네비게이션 컴포넌트

const ProtectedLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // 인증되지 않은 경우 null 반환 (리다이렉트 처리 중)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation
        currentPage={window.location.pathname.split('/')[1] || 'dashboard'}
        onPageChange={(page) => navigate(`/${page}`)}
      />
      <div className="flex-grow">{children}</div>
    </div>
  );
};

export default ProtectedLayout;
