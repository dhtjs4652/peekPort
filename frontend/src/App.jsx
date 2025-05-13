import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import PortfolioManagement from './components/PortfolioManagement';
import PortfolioAnalysis from './components/PortfolioAnalysis';
import Navigation from './components/Navigation';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(true); // 페이지 전환 애니메이션 상태

  // 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setFadeIn(false);
    setTimeout(() => {
      setCurrentPage(page);
      setFadeIn(true);
    }, 150);
  };

  // 페이지에 따른 컴포넌트 렌더링
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'portfolio':
        return <PortfolioManagement />;
      case 'analysis':
        return <PortfolioAnalysis />;
      default:
        return <Dashboard />;
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 메인 앱 화면
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* 사이드바 공간 확보 (pl-64 유지) */}
      <div className="md:pl-64 pt-16 md:pt-0 min-h-screen">
        <div 
          className={`max-w-full px-4 md:px-8 py-4 md:py-6 space-y-6 transition-opacity duration-300 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
