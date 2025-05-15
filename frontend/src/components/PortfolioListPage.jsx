// PortfolioListPage.jsx - 포트폴리오 목록 페이지 컴포넌트
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PortfolioListPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // fetchPortfolios 함수를 useEffect 전에 선언
  const fetchPortfolios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // localStorage에서 토큰 가져오기
      const token = localStorage.getItem('token');

      // 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!token) {
        console.log('인증 토큰이 없습니다. 로그인 페이지로 이동합니다.');
        navigate('/login');
        return;
      }

      console.log('포트폴리오 목록 요청 중...');

      // Authorization 헤더에 Bearer 토큰 포함하여 요청
      const response = await axios.get('/api/portfolios', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('포트폴리오 목록 응답:', response.data);

      // 응답 데이터 처리 (백엔드 응답 구조에 따라 경로 조정 필요)
      const portfolioData = Array.isArray(response.data)
        ? response.data
        : response.data?.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setPortfolios(portfolioData);
    } catch (err) {
      console.error('포트폴리오 목록 불러오기 실패:', err);

      // 인증 오류(401) 처리
      if (err.response && err.response.status === 401) {
        setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token'); // 토큰 삭제
        setTimeout(() => navigate('/login'), 2000); // 2초 후 로그인 페이지로 이동
        return;
      }

      // 기타 오류 처리
      setError('포트폴리오 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]); // navigate를 의존성 배열에 추가

  useEffect(() => {
    // 컴포넌트 마운트 시 포트폴리오 목록 불러오기
    fetchPortfolios();
  }, [fetchPortfolios]); // fetchPortfolios를 의존성 배열에 추가

  // 새 포트폴리오로 이동하는 함수
  const handleCreatePortfolio = () => {
    navigate('/portfolio/new');
  };

  // 특정 포트폴리오 상세 페이지로 이동하는 함수
  const handlePortfolioClick = (portfolioId) => {
    navigate(`/portfolio/${portfolioId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 포트폴리오</h1>
        <button
          onClick={handleCreatePortfolio}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          + 새 포트폴리오
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : portfolios.length === 0 ? (
        // 포트폴리오가 없는 경우
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            포트폴리오가 없습니다
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            새 포트폴리오를 만들어 투자를 시작해보세요.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreatePortfolio}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              새 포트폴리오 만들기
            </button>
          </div>
        </div>
      ) : (
        // 포트폴리오 목록 표시
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              onClick={() => handlePortfolioClick(portfolio.id)}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {portfolio.title}
                </h2>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>
                    총 자산: {portfolio.totalAmount?.toLocaleString() || 0}원
                  </span>
                  <span>
                    목표: {portfolio.targetAmount?.toLocaleString() || 0}원
                  </span>
                </div>

                {/* 진행률 바 */}
                {portfolio.targetAmount > 0 && (
                  <div className="mt-2">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            (portfolio.totalAmount / portfolio.targetAmount) *
                              100
                          )}%`,
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {Math.round(
                        (portfolio.totalAmount / portfolio.targetAmount) * 100
                      )}
                      % 달성
                    </div>
                  </div>
                )}

                {/* 종목 수 또는 추가 정보 */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {portfolio.stockCount || 0}개 종목
                    </span>
                    <span className="text-blue-600">상세보기 →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioListPage;
