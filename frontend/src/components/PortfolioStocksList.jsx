import React, { useState, useEffect, useCallback } from 'react';
import { authAxios } from '../utils/authUtils';
import { Loader2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

// 포트폴리오 종목 목록 조회 컴포넌트
const PortfolioStocksList = ({ portfolioId }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 종목 목록 조회 함수
  const fetchStocks = useCallback(async () => {
    if (!portfolioId) {
      setError('포트폴리오 ID가 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`종목 목록 요청: 포트폴리오 ID ${portfolioId}`);

      const response = await authAxios.get(
        `/api/portfolios/${portfolioId}/stocks`
      );
      console.log('종목 API 응답:', response.data);

      // 응답 데이터 처리
      const stocksData = Array.isArray(response.data)
        ? response.data
        : response.data?.data && Array.isArray(response.data.data)
        ? response.data.data
        : [];

      setStocks(stocksData);
    } catch (err) {
      console.error('종목 조회 실패:', err);

      // 에러 타입별 처리
      if (err.response && err.response.status === 403) {
        setError('이 포트폴리오에 접근할 권한이 없습니다.');
      } else if (err.response && err.response.status === 404) {
        setError('포트폴리오를 찾을 수 없습니다.');
      } else {
        setError('종목을 조회하는 중 오류가 발생했습니다.');
      }
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  // 컴포넌트 마운트 시 및 portfolioId 변경 시 종목 조회
  useEffect(() => {
    if (portfolioId) {
      fetchStocks();
    }
  }, [portfolioId, fetchStocks]);

  // 정렬 처리 함수
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터 반환
  const sortedStocks = React.useMemo(() => {
    let sortableStocks = [...stocks];
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableStocks;
  }, [stocks, sortConfig]);

  // 투자기간 한글 라벨
  const termLabels = {
    short: '단기',
    mid: '중기',
    long: '장기',
  };

  // 수익률 계산 함수
  const calculateReturnRate = (purchasePrice, currentPrice) => {
    if (!purchasePrice || !currentPrice) return 0;
    return ((currentPrice - purchasePrice) / purchasePrice) * 100;
  };

  // 총 투자 금액 계산
  const calculateTotalInvestment = (stocks) => {
    return stocks.reduce((total, stock) => {
      return total + stock.purchasePrice * stock.quantity;
    }, 0);
  };

  // 현재 평가 금액 계산
  const calculateCurrentValue = (stocks) => {
    return stocks.reduce((total, stock) => {
      return total + stock.currentPrice * stock.quantity;
    }, 0);
  };

  // 총 손익 계산
  const calculateTotalProfitLoss = (stocks) => {
    return stocks.reduce((total, stock) => {
      const investment = stock.purchasePrice * stock.quantity;
      const currentValue = stock.currentPrice * stock.quantity;
      return total + (currentValue - investment);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">종목 목록을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">오류 발생</span>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchStocks}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg mb-2">
          등록된 종목이 없습니다.
        </div>
        <p className="text-gray-400">새로운 종목을 추가해보세요.</p>
      </div>
    );
  }

  const totalInvestment = calculateTotalInvestment(stocks);
  const currentValue = calculateCurrentValue(stocks);
  const totalProfitLoss = calculateTotalProfitLoss(stocks);
  const totalReturnRate =
    totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* 포트폴리오 요약 정보 */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">포트폴리오 종목 현황</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">총 투자금액</div>
            <div className="text-lg font-bold text-blue-800">
              {totalInvestment.toLocaleString()}원
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">
              현재 평가금액
            </div>
            <div className="text-lg font-bold text-green-800">
              {currentValue.toLocaleString()}원
            </div>
          </div>
          <div
            className={`p-4 rounded-lg ${
              totalProfitLoss >= 0 ? 'bg-red-50' : 'bg-blue-50'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                totalProfitLoss >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              총 손익
            </div>
            <div
              className={`text-lg font-bold flex items-center ${
                totalProfitLoss >= 0 ? 'text-red-800' : 'text-blue-800'
              }`}
            >
              {totalProfitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {totalProfitLoss >= 0 ? '+' : ''}
              {totalProfitLoss.toLocaleString()}원
            </div>
          </div>
          <div
            className={`p-4 rounded-lg ${
              totalReturnRate >= 0 ? 'bg-red-50' : 'bg-blue-50'
            }`}
          >
            <div
              className={`text-sm font-medium ${
                totalReturnRate >= 0 ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              총 수익률
            </div>
            <div
              className={`text-lg font-bold ${
                totalReturnRate >= 0 ? 'text-red-800' : 'text-blue-800'
              }`}
            >
              {totalReturnRate >= 0 ? '+' : ''}
              {totalReturnRate.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* 종목 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                종목명
                {sortConfig.key === 'name' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('ticker')}
              >
                티커
                {sortConfig.key === 'ticker' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('quantity')}
              >
                수량
                {sortConfig.key === 'quantity' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('purchasePrice')}
              >
                매수가
                {sortConfig.key === 'purchasePrice' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('currentPrice')}
              >
                현재가
                {sortConfig.key === 'currentPrice' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                평가손익
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                수익률
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                카테고리
                {sortConfig.key === 'category' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('term')}
              >
                투자기간
                {sortConfig.key === 'term' && (
                  <span className="ml-1">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStocks.map((stock) => {
              const profitLoss =
                (stock.currentPrice - stock.purchasePrice) * stock.quantity;
              const returnRate = calculateReturnRate(
                stock.purchasePrice,
                stock.currentPrice
              );
              const isProfit = profitLoss >= 0;

              return (
                <tr
                  key={stock.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {stock.name || '이름 없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.ticker || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {stock.quantity?.toLocaleString() || 0}주
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {stock.purchasePrice?.toLocaleString() || 0}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {stock.currentPrice?.toLocaleString() || 0}원
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      isProfit ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {profitLoss.toLocaleString()}원
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                      isProfit ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {returnRate.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.category || '미분류'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        stock.term === 'short'
                          ? 'bg-orange-100 text-orange-800'
                          : stock.term === 'mid'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {termLabels[stock.term] || stock.term}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 테이블 하단 정보 */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">총 {stocks.length}개 종목</div>
      </div>
    </div>
  );
};

export default PortfolioStocksList;
