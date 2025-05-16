// pages/HomePage.jsx - 초기 진입 메인 소개 페이지
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { isAuthenticated } from '../utils/authUtils';

const HomePage = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  // 로그인 상태라면 대시보드로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [navigate, isLoggedIn]);

  // 로그인한 경우 리다이렉트되기 전 로딩 표시
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">대시보드로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-6">
            PeekPort에 오신 것을 환영합니다!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            당신의 포트폴리오를 한 눈에 보고, 관리하고, 분석하세요. PeekPort와
            함께라면 투자 여정이 더 쉬워집니다.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center"
            >
              무료로 시작하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              to="/login"
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition-colors"
            >
              로그인
            </Link>
          </div>

          {/* 앱 특징 섹션 */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                자산 현황
              </h3>
              <p className="text-gray-600">
                모든 자산을 한 곳에서 관리하고 실시간으로 가치를 추적하세요.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                포트폴리오 관리
              </h3>
              <p className="text-gray-600">
                직관적인 인터페이스로 포트폴리오를 쉽게 관리하세요.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                포트폴리오 분석
              </h3>
              <p className="text-gray-600">
                데이터 기반 분석으로 현명한 투자 결정을 내리세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
