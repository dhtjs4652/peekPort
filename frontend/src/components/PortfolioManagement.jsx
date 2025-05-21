import React, { useState, useEffect } from 'react';
import { authAxios } from '../utils/authUtils'; // axios 대신 authAxios 사용
import { Plus, Trash2, Edit2, X, CheckCircle } from 'lucide-react';

// 포트폴리오 관리 컴포넌트
const PortfolioManagement = () => {
  // ✅ 상태 관리
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null); // 안내 메시지를 위한 상태 추가
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('short');

  // ✅ 신규 종목 상태
  const [newStock, setNewStock] = useState({
    name: '',
    purchasePrice: '',
    quantity: '',
    term: 'short',
  });

  // ✅ 포트폴리오 목록 조회 함수
  const fetchPortfolios = async () => {
    try {
      setLoadingPortfolios(true);
      setError(null);

      console.log('포트폴리오 목록 요청 시작');
      const response = await authAxios.get('/api/portfolios');

      console.log('API 응답 데이터:', response.data);

      // 응답 데이터가 배열인지 확인
      const portfolioData = Array.isArray(response.data)
        ? response.data
        : response.data?.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log('처리된 포트폴리오 데이터:', portfolioData);
      setPortfolios(portfolioData);

      // 첫 번째 포트폴리오 자동 선택 대신,
      // 포트폴리오 선택 없이 처음에는 안내 메시지만 표시 (자동 선택 제거)
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setInfoMessage('포트폴리오를 선택해주세요');
      }
    } catch (err) {
      console.error('포트폴리오 로딩 실패:', err);
      console.error('오류 상세 정보:', err.response?.data || err.message);
      setError('포트폴리오를 로딩하는 중 오류가 발생했습니다.');
      // 오류 발생 시 빈 배열로 초기화
      setPortfolios([]);
    } finally {
      setLoadingPortfolios(false);
    }
  };

  // ✅ 종목 목록 조회 함수
  const fetchStocksByPortfolioId = async (portfolioId) => {
    try {
      setLoadingStocks(true);
      console.log(`종목 목록 요청 시작: 포트폴리오 ID ${portfolioId}`);

      // 요청 URL 로깅
      const url = `/api/portfolios/${portfolioId}/stocks`;
      console.log('요청 URL:', url);

      const response = await authAxios.get(url);
      console.log('종목 API 응답 데이터:', response.data);

      // 응답 데이터가 배열인지 확인
      const stocksData = Array.isArray(response.data)
        ? response.data
        : response.data?.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      console.log('처리된 종목 데이터:', stocksData);
      setStocks(stocksData);
    } catch (err) {
      console.error('종목 로딩 실패:', err);

      // 요청 및 응답 세부 정보 로깅
      if (err.request) console.error('요청 정보:', err.request);
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);
      }

      // 403 오류 명시적 처리
      if (err.response && err.response.status === 403) {
        setError('이 포트폴리오에 접근할 권한이 없습니다.');
      } else {
        setError('종목을 로딩하는 중 오류가 발생했습니다.');
      }

      // 오류 발생 시 빈 배열로 초기화
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

  // ✅ 컴포넌트 마운트 시 포트폴리오 로딩
  useEffect(() => {
    console.log('컴포넌트 마운트, 포트폴리오 로딩 시작');
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 포트폴리오 선택 핸들러
  const handlePortfolioSelect = (portfolio) => {
    console.log('포트폴리오 선택:', portfolio);
    setSelectedPortfolio(portfolio);

    // 포트폴리오 선택 시 "포트폴리오를 선택해주세요" 안내 메시지만 제거
    if (infoMessage === '포트폴리오를 선택해주세요') {
      setInfoMessage(null);
    }

    if (portfolio && portfolio.id) {
      fetchStocksByPortfolioId(portfolio.id);
    } else {
      console.error('선택된 포트폴리오에 ID가 없습니다');
      setStocks([]);
    }
  };

  // ✅ 포트폴리오 등록 함수
  const handlePortfolioSubmit = async () => {
    try {
      if (!portfolioName) {
        setError('포트폴리오 이름을 입력해주세요.');
        return;
      }

      console.log('포트폴리오 등록 요청 데이터:', {
        name: portfolioName,
        totalAmount: totalAmount ? Number(totalAmount) : 0,
        targetAmount: targetAmount ? Number(targetAmount) : 0,
      });

      const response = await authAxios.post('/api/portfolios', {
        name: portfolioName,
        totalAmount: totalAmount ? Number(totalAmount) : 0,
        targetAmount: targetAmount ? Number(targetAmount) : 0,
      });

      console.log('포트폴리오 등록 응답:', response.data);

      // 성공 메시지 표시
      setSuccessMessage('포트폴리오가 등록되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);

      // 폼 초기화
      setPortfolioName('');
      setTotalAmount('');
      setTargetAmount('');

      // 포트폴리오 목록 갱신
      fetchPortfolios();
    } catch (err) {
      console.error('등록 실패:', err);

      // 자세한 오류 정보 로깅
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        // 구체적인 오류 메시지 표시
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`서버 오류 (${err.response.status}): 등록에 실패했습니다.`);
        }
      } else if (err.request) {
        console.error('요청 정보:', err.request);
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
      } else {
        console.error('오류 메시지:', err.message);
        setError('요청 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // ✅ 종목 추가 함수
  const handleAddStock = async () => {
    try {
      // 입력 검증
      if (!newStock.name || !newStock.purchasePrice || !newStock.quantity) {
        setError('모든 필드를 입력해주세요.');
        return;
      }

      if (!selectedPortfolio) {
        setError('포트폴리오를 먼저 선택해주세요.');
        return;
      }

      // API 호출 전 로깅
      console.log('종목 추가 요청 데이터:', {
        name: newStock.name,
        purchasePrice: Number(newStock.purchasePrice),
        quantity: Number(newStock.quantity),
        term: newStock.term,
        currentPrice: Number(newStock.purchasePrice),
      });

      // API 호출
      const response = await authAxios.post(
        `/api/portfolios/${selectedPortfolio.id}/stocks`,
        {
          name: newStock.name,
          purchasePrice: Number(newStock.purchasePrice),
          quantity: Number(newStock.quantity),
          term: newStock.term,
          currentPrice: Number(newStock.purchasePrice), // 초기값은 매수가와 동일하게 설정
        }
      );

      console.log('종목 추가 응답:', response.data);

      // 성공 메시지 표시
      setSuccessMessage('종목이 추가되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);

      // 폼 초기화
      setNewStock({
        name: '',
        purchasePrice: '',
        quantity: '',
        term: activeTab,
      });

      // 종목 목록 갱신
      fetchStocksByPortfolioId(selectedPortfolio.id);
    } catch (err) {
      console.error('종목 추가 실패:', err);

      // 자세한 오류 정보 로깅
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        // 구체적인 오류 메시지 표시
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(
            `서버 오류 (${err.response.status}): 종목 추가에 실패했습니다.`
          );
        }
      } else if (err.request) {
        console.error('요청 정보:', err.request);
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
      } else {
        console.error('오류 메시지:', err.message);
        setError('요청 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // ✅ 종목 삭제 함수
  const handleDeleteStock = async (stockId) => {
    try {
      if (!selectedPortfolio) {
        setError('포트폴리오를 먼저 선택해주세요.');
        return;
      }

      console.log(
        `종목 삭제 요청: 포트폴리오 ID ${selectedPortfolio.id}, 종목 ID ${stockId}`
      );

      await authAxios.delete(
        `/api/portfolios/${selectedPortfolio.id}/stocks/${stockId}`
      );

      console.log('종목 삭제 성공');

      // 화면에서 종목 제거
      setStocks((prev) =>
        Array.isArray(prev) ? prev.filter((stock) => stock.id !== stockId) : []
      );

      // 성공 메시지 표시
      setSuccessMessage('종목이 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('종목 삭제 실패:', err);

      // 자세한 오류 정보 로깅
      if (err.response) {
        console.error('응답 상태:', err.response.status);
        console.error('응답 데이터:', err.response.data);

        // 구체적인 오류 메시지 표시
        if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(
            `서버 오류 (${err.response.status}): 종목 삭제에 실패했습니다.`
          );
        }
      } else if (err.request) {
        console.error('요청 정보:', err.request);
        setError('서버에 연결할 수 없습니다. 네트워크 연결을 확인하세요.');
      } else {
        console.error('오류 메시지:', err.message);
        setError('요청 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 탭 관련 설정
  const termTabs = ['short', 'mid', 'long'];
  const termLabels = {
    short: '단기',
    mid: '중기',
    long: '장기',
  };

  // 디버깅 메시지 출력
  console.log('현재 포트폴리오 상태:', {
    portfolios,
    selectedPortfolio,
    stocks,
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">포트폴리오 관리</h1>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <X className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900 text-sm mt-2"
          >
            닫기
          </button>
        </div>
      )}

      {/* 안내 메시지 표시 */}
      {infoMessage && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <p>{infoMessage}</p>
          </div>
        </div>
      )}

      {/* 성공 메시지 표시 */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center shadow-lg">
          <CheckCircle className="h-4 w-4 mr-2" />
          {successMessage}
        </div>
      )}

      {/* 포트폴리오 선택 UI */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">포트폴리오 선택</h2>
        {loadingPortfolios ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(portfolios) && portfolios.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            등록된 포트폴리오가 없습니다. 새 포트폴리오를 등록해보세요.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Array.isArray(portfolios) &&
              portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => handlePortfolioSelect(portfolio)}
                  className={`px-4 py-2 rounded transition-all duration-200 ${
                    selectedPortfolio?.id === portfolio.id
                      ? 'bg-blue-500 text-white shadow'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
                  }`}
                >
                  {portfolio.name || '이름 없음'}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* 포트폴리오 등록 UI */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">포트폴리오 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
            placeholder="포트폴리오 이름"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="현재 자산"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
          <input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="목표 자산"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
          />
        </div>
        <button
          onClick={handlePortfolioSubmit}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          포트폴리오 등록
        </button>
      </div>

      {/* 종목 추가 UI */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-bold mb-4">종목 추가</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="종목명"
            value={newStock.name}
            onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            disabled={!selectedPortfolio}
          />
          <input
            type="number"
            placeholder="매수가"
            value={newStock.purchasePrice}
            onChange={(e) =>
              setNewStock({ ...newStock, purchasePrice: e.target.value })
            }
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            disabled={!selectedPortfolio}
          />
          <input
            type="number"
            placeholder="수량"
            value={newStock.quantity}
            onChange={(e) =>
              setNewStock({ ...newStock, quantity: e.target.value })
            }
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            disabled={!selectedPortfolio}
          />
          <select
            value={newStock.term}
            onChange={(e) => setNewStock({ ...newStock, term: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
            disabled={!selectedPortfolio}
          >
            {termTabs.map((term) => (
              <option key={term} value={term}>
                {termLabels[term]}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAddStock}
          className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all duration-200 flex items-center justify-center ${
            !selectedPortfolio ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!selectedPortfolio}
        >
          <Plus className="h-4 w-4 mr-2" />
          종목 추가
        </button>
        {!selectedPortfolio && (
          <p className="text-sm text-orange-500 mt-2">
            종목을 추가하려면 먼저 포트폴리오를 선택해주세요.
          </p>
        )}
      </div>

      {/* 종목 목록 UI */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            {termTabs.map((term) => (
              <button
                key={term}
                onClick={() => setActiveTab(term)}
                className={`px-4 py-2 rounded transition-all duration-200 ${
                  activeTab === term
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow'
                }`}
                disabled={!selectedPortfolio}
              >
                {termLabels[term]}
              </button>
            ))}
          </div>
        </div>

        {!selectedPortfolio ? (
          <div className="text-center py-10 text-gray-500">
            종목을 관리하려면 먼저 포트폴리오를 선택해주세요.
          </div>
        ) : loadingStocks ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : Array.isArray(stocks) &&
          stocks.filter((stock) => stock.term === activeTab).length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {termLabels[activeTab]} 기간의 종목이 없습니다. 새 종목을
            추가해보세요.
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(stocks) &&
              stocks
                .filter((stock) => stock.term === activeTab)
                .map((stock) => (
                  <div
                    key={stock.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">
                          {stock.name || '이름 없음'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {stock.quantity || 0}주 ×{' '}
                          {stock.purchasePrice
                            ? stock.purchasePrice.toLocaleString()
                            : '0'}
                          원
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteStock(stock.id)}
                        className="text-gray-400 hover:text-red-500 transition-all duration-150"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;
