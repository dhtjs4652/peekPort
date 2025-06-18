// components/PublicNavigation.jsx - 공개 페이지용 네비게이션 바
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, LogIn, UserPlus, LogOut, Menu, X, User } from 'lucide-react';
import { isAuthenticated, logout } from '../utils/authUtils';

const PublicNavigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const handleLogout = () => {
    logout(); // authUtils에서 가져온 로그아웃 함수
    navigate('/'); // 로그아웃 후 홈페이지로 리다이렉트
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-blue-600 font-bold text-xl">PeekPort</span>
            </Link>
          </div>

          {/* 가운데 네비게이션 메뉴 (데스크톱) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>홈</span>
            </Link>

            {isLoggedIn && (
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <span>대시보드</span>
              </Link>
            )}
          </div>

          {/* 오른쪽 로그인/회원가입 버튼 (데스크톱) */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-1" />
                  <span>환영합니다!</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      location.pathname === '/login'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>로그인</span>
                </Link>

                <Link
                  to="/signup"
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span>회원가입</span>
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t bg-gray-50">
            <div className="space-y-1">
              <Link
                to="/"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors
                  ${
                    location.pathname === '/'
                      ? 'text-blue-600 bg-white shadow-sm'
                      : 'text-gray-600 hover:bg-white hover:shadow-sm'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4 mr-3" />
                <span>홈</span>
              </Link>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg mx-2 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>대시보드</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg mx-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors
                      ${
                        location.pathname === '/login'
                          ? 'text-blue-600 bg-white shadow-sm'
                          : 'text-gray-600 hover:bg-white hover:shadow-sm'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-3" />
                    <span>로그인</span>
                  </Link>

                  <Link
                    to="/signup"
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg mx-2 text-sm font-medium transition-colors shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserPlus className="h-4 w-4 mr-3" />
                    <span>회원가입</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavigation;
