// components/Navigation.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  PieChart,
  BarChart2,
  Menu,
  X,
  LogOut,
  User,
  ArrowLeft,
} from 'lucide-react';
import Logo from '../assets/PeekPort_logo.png';
import { logout } from '../utils/authUtils';

const Navigation = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: '자산 현황', icon: Home },
    { id: 'portfolio', label: '포트폴리오 관리', icon: PieChart },
    { id: 'analysis', label: '포트폴리오 분석', icon: BarChart2 },
  ];

  return (
    <>
      {/* 상단 헤더 바 (데스크톱 - 사이드바와 함께 사용) */}
      <div className="hidden md:block fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between h-full px-6">
          {/* 현재 페이지 제목 */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find((item) => item.id === currentPage)?.label ||
                '대시보드'}
            </h1>
          </div>

          {/* 오른쪽 사용자 메뉴 */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>홈으로</span>
            </Link>

            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>사용자님</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>

      {/* 데스크톱 사이드바 */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r shadow-md z-20">
        {/* 로고 영역 */}
        <div className="flex items-center justify-center h-24 border-b border-gray-100">
          <img
            src={Logo}
            alt="PeekPort Logo"
            onClick={() => onPageChange('dashboard')}
            className="w-[180px] h-auto object-contain cursor-pointer transition-opacity hover:opacity-80"
          />
        </div>

        {/* 메뉴 영역 */}
        <div className="p-5">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center w-full px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`h-4 w-4 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-4 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 사용자 정보 (기존 유지) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">A</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">사용자님</p>
                <p className="text-xs">자산 관리자</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="로그아웃"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 상단바 */}
      <div className="block md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-20 shadow-sm">
        <img
          src={Logo}
          alt="PeekPort Logo"
          onClick={() => onPageChange('dashboard')}
          className="h-10 w-auto object-contain cursor-pointer transition-opacity hover:opacity-80"
        />

        <div className="flex items-center space-x-2">
          {/* 홈으로 버튼 */}
          <Link
            to="/"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            title="홈으로"
          >
            <ArrowLeft size={20} />
          </Link>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500"
            title="로그아웃"
          >
            <LogOut size={20} />
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="block md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30">
          <div className="p-4 space-y-2">
            {/* 홈으로 링크 */}
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-3" />
              <span>홈으로</span>
            </Link>

            {/* 메뉴 아이템들 */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon
                    className={`h-4 w-4 mr-3 ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-3"></div>

            {/* 사용자 정보 */}
            <div className="flex items-center px-4 py-3 text-sm text-gray-600">
              <User className="h-4 w-4 mr-3" />
              <span>사용자님으로 로그인됨</span>
            </div>

            {/* 로그아웃 버튼 */}
            <button
              onClick={() => {
                handleLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
