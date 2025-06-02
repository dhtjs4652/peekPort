// components/Navigation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, BarChart2, Menu, X, LogOut } from 'lucide-react';
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

        {/* 사용자 정보 */}
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

            {/* 로그아웃 버튼 추가 */}
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
          {/* 로그아웃 버튼 추가 */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
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

      {/* 모바일 메뉴 (나머지 코드는 동일) */}
      {/* ... */}
    </>
  );
};

export default Navigation;
