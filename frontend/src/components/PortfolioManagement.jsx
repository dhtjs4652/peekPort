import React, { useState, useEffect, useCallback } from 'react';
import { authAxios } from '../utils/authUtils';
import StockDetailModal from './StockDetailModal';
import {
  Plus,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  Activity,
  Wallet,
  Save,
  Shield,
  BarChart,
  Zap,
} from 'lucide-react';

const PortfolioManagement = () => {
  // 기존 상태 관리
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [cash, setCash] = useState('');
  const [portfolioType, setPortfolioType] = useState('BALANCED');
  const [stocks, setStocks] = useState([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [loadingStocks, setLoadingStocks] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('short');

  // 포트폴리오 요약 상태
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // 현금 수정 관련 상태
  const [editingCash, setEditingCash] = useState(null);
  const [editCashValue, setEditCashValue] = useState('');
  const [loadingCashUpdate, setLoadingCashUpdate] = useState(false);

  // ✅ 종목 상세 모달 관련 상태 추가
  const [selectedStockForDetail, setSelectedStockForDetail] = useState(null);
  const [isStockDetailModalOpen, setIsStockDetailModalOpen] = useState(false);

  const [newStock, setNewStock] = useState({
    name: '',
    purchasePrice: '',
    quantity: '',
    term: 'short',
  });

  // 수정 관련 상태
  const [editingStock, setEditingStock] = useState(null);
  const [editStock, setEditStock] = useState({
    name: '',
    purchasePrice: '',
    quantity: '',
    currentPrice: '',
    term: 'short',
  });

  // 투자 성향 옵션 정의
  const portfolioTypeOptions = [
    {
      value: 'CONSERVATIVE',
      label: '보수형',
      description: '안정적인 수익을 추구하는 투자',
      icon: Shield,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500',
    },
    {
      value: 'BALANCED',
      label: '균형형',
      description: '안정성과 수익성의 균형을 추구',
      icon: BarChart,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-500',
    },
    {
      value: 'AGGRESSIVE',
      label: '공격형',
      description: '높은 수익률을 목표로 하는 투자',
      icon: Zap,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-500',
    },
  ];

  // 투자 성향별 라벨 매핑
  const getPortfolioTypeLabel = (type) => {
    const option = portfolioTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  // ✅ 종목 상세 모달 관련 핸들러 추가
  const handleStockClick = (stock) => {
    setSelectedStockForDetail(stock);
    setIsStockDetailModalOpen(true);
  };

  const handleCloseStockDetail = () => {
    setIsStockDetailModalOpen(false);
    setSelectedStockForDetail(null);
  };

  // 현금 수정 함수
  const handleCashEdit = (portfolio) => {
    setEditingCash(portfolio.id);
    setEditCashValue(portfolio.cash || 0);
  };

  const handleCashUpdate = async (portfolioId) => {
    try {
      setLoadingCashUpdate(true);
      await authAxios.put(`/api/portfolios/${portfolioId}/cash`, {
        cash: Number(editCashValue),
      });

      setSuccessMessage('현금이 업데이트되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);

      fetchPortfolios();

      if (selectedPortfolio && selectedPortfolio.id === portfolioId) {
        fetchPortfolioSummary(portfolioId);
      }

      setEditingCash(null);
      setEditCashValue('');
    } catch (err) {
      console.error('현금 업데이트 실패:', err);
      setError('현금 업데이트에 실패했습니다.');
    } finally {
      setLoadingCashUpdate(false);
    }
  };

  const handleCashCancel = () => {
    setEditingCash(null);
    setEditCashValue('');
  };

  // 포트폴리오 요약 조회 함수
  const fetchPortfolioSummary = async (portfolioId) => {
    if (!portfolioId) return;

    try {
      setLoadingSummary(true);
      const response = await authAxios.get(
        `/api/portfolios/${portfolioId}/summary`
      );
      setPortfolioSummary(response.data);
    } catch (err) {
      console.error('포트폴리오 요약 조회 실패:', err);
      setPortfolioSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 기존 함수들
  const fetchPortfolios = useCallback(async () => {
    try {
      setLoadingPortfolios(true);
      setError(null);
      const response = await authAxios.get('/api/portfolios');
      const portfolioData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setPortfolios(portfolioData);
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setInfoMessage('포트폴리오를 선택해주세요');
      }
    } catch {
      setError('포트폴리오를 로딩하는 중 오류가 발생했습니다.');
      setPortfolios([]);
    } finally {
      setLoadingPortfolios(false);
    }
  }, [selectedPortfolio]);

  const fetchStocksByPortfolioId = async (portfolioId) => {
    try {
      setLoadingStocks(true);
      const url = `/api/portfolios/${portfolioId}/stocks`;
      const response = await authAxios.get(url);
      const stocksData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setStocks(stocksData);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError('이 포트폴리오에 접근할 권한이 없습니다.');
      } else {
        setError('종목을 로딩하는 중 오류가 발생했습니다.');
      }
      setStocks([]);
    } finally {
      setLoadingStocks(false);
    }
  };

  // 포트폴리오 선택 시 요약 정보도 함께 조회
  const handlePortfolioSelect = (portfolio) => {
    setSelectedPortfolio(portfolio);
    if (infoMessage === '포트폴리오를 선택해주세요') {
      setInfoMessage(null);
    }
    if (portfolio && portfolio.id) {
      fetchStocksByPortfolioId(portfolio.id);
      fetchPortfolioSummary(portfolio.id);
    } else {
      setStocks([]);
      setPortfolioSummary(null);
    }
  };

  const handlePortfolioSubmit = async () => {
    try {
      if (!portfolioName) {
        setError('포트폴리오 이름을 입력해주세요.');
        return;
      }
      await authAxios.post('/api/portfolios', {
        name: portfolioName,
        totalAmount: totalAmount ? Number(totalAmount) : 0,
        cash: cash ? Number(cash) : 0,
        portfolioType: portfolioType,
      });
      setSuccessMessage('포트폴리오가 등록되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setPortfolioName('');
      setTotalAmount('');
      setCash('');
      setPortfolioType('BALANCED');
      fetchPortfolios();
    } catch {
      setError('포트폴리오 등록에 실패했습니다.');
    }
  };

  // 종목 추가/수정 후 요약 정보 갱신
  const handleAddStock = async () => {
    try {
      if (!newStock.name || !newStock.purchasePrice || !newStock.quantity) {
        setError('모든 필드를 입력해주세요.');
        return;
      }
      if (!selectedPortfolio) {
        setError('포트폴리오를 먼저 선택해주세요.');
        return;
      }
      await authAxios.post(
        `/api/portfolios/${selectedPortfolio.id}/stocks/add`,
        {
          name: newStock.name,
          purchasePrice: Number(newStock.purchasePrice),
          quantity: Number(newStock.quantity),
          term: newStock.term,
          currentPrice: Number(newStock.purchasePrice),
          category: null,
          memo: null,
        }
      );
      setSuccessMessage('종목이 추가되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setNewStock({
        name: '',
        purchasePrice: '',
        quantity: '',
        term: activeTab,
      });
      fetchStocksByPortfolioId(selectedPortfolio.id);
      fetchPortfolioSummary(selectedPortfolio.id);
    } catch {
      setError('종목 추가에 실패했습니다.');
    }
  };

  const handleDeleteStock = async (stockId) => {
    try {
      if (!selectedPortfolio) {
        setError('포트폴리오를 먼저 선택해주세요.');
        return;
      }
      await authAxios.delete(
        `/api/portfolios/${selectedPortfolio.id}/stocks/${stockId}`
      );
      setStocks((prev) =>
        Array.isArray(prev) ? prev.filter((stock) => stock.id !== stockId) : []
      );
      setSuccessMessage('종목이 삭제되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchPortfolioSummary(selectedPortfolio.id);
    } catch {
      setError('종목 삭제에 실패했습니다.');
    }
  };

  const handleEditStock = (stock) => {
    setEditingStock(stock.id);
    setEditStock({
      name: stock.name || '',
      purchasePrice: stock.purchasePrice || '',
      quantity: stock.quantity || '',
      currentPrice: stock.currentPrice || stock.purchasePrice || '',
      term: stock.term || 'short',
    });
  };

  const handleUpdateStock = async () => {
    try {
      if (!editStock.name || !editStock.purchasePrice || !editStock.quantity) {
        setError('모든 필드를 입력해주세요.');
        return;
      }
      if (!selectedPortfolio || !editingStock) {
        setError('수정할 종목을 선택해주세요.');
        return;
      }

      await authAxios.put(
        `/api/portfolios/${selectedPortfolio.id}/stocks/${editingStock}`,
        {
          name: editStock.name,
          purchasePrice: Number(editStock.purchasePrice),
          quantity: Number(editStock.quantity),
          currentPrice: Number(editStock.currentPrice),
          term: editStock.term,
        }
      );

      setSuccessMessage('종목이 수정되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);

      setEditingStock(null);
      setEditStock({
        name: '',
        purchasePrice: '',
        quantity: '',
        currentPrice: '',
        term: 'short',
      });

      fetchStocksByPortfolioId(selectedPortfolio.id);
      fetchPortfolioSummary(selectedPortfolio.id);
    } catch {
      setError('종목 수정에 실패했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setEditStock({
      name: '',
      purchasePrice: '',
      quantity: '',
      currentPrice: '',
      term: 'short',
    });
  };

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 기존 계산 함수들
  const termTabs = ['short', 'mid', 'long'];
  const termLabels = {
    short: '단기',
    mid: '중기',
    long: '장기',
  };

  const currentTabStocks = Array.isArray(stocks)
    ? stocks.filter((stock) => stock.term === activeTab)
    : [];

  const calculateTotals = (stocks) => {
    if (!Array.isArray(stocks) || stocks.length === 0) {
      return {
        totalInvestment: 0,
        totalValue: 0,
        totalProfitLoss: 0,
        totalReturnRate: 0,
      };
    }

    const totals = stocks.reduce(
      (acc, stock) => {
        const investment = (stock.purchasePrice || 0) * (stock.quantity || 0);
        const value =
          (stock.currentPrice || stock.purchasePrice || 0) *
          (stock.quantity || 0);

        acc.totalInvestment += investment;
        acc.totalValue += value;

        return acc;
      },
      { totalInvestment: 0, totalValue: 0 }
    );

    totals.totalProfitLoss = totals.totalValue - totals.totalInvestment;
    totals.totalReturnRate =
      totals.totalInvestment > 0
        ? (totals.totalProfitLoss / totals.totalInvestment) * 100
        : 0;

    return totals;
  };

  const totals = calculateTotals(currentTabStocks);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          포트폴리오 관리
        </h1>
        <p className="text-gray-600">
          투자 종목을 체계적으로 관리하고 수익률을 확인하세요
        </p>
      </div>

      {/* 에러 및 성공 메시지 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <X className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {infoMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
          <p className="text-blue-700">{infoMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center shadow-xl z-50 animate-bounce">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* 포트폴리오 요약 대시보드 */}
      {selectedPortfolio && (
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <div className="flex items-center mb-6">
            <Activity className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              {selectedPortfolio.name} 요약
            </h2>
            {/* 투자 성향 표시 */}
            <div className="ml-auto flex items-center">
              {(() => {
                const typeOption = portfolioTypeOptions.find(
                  (opt) => opt.value === selectedPortfolio.portfolioType
                );
                const IconComponent = typeOption?.icon || BarChart;
                return (
                  <div
                    className={`flex items-center px-3 py-1 rounded-full ${
                      typeOption?.bgColor || 'bg-gray-50'
                    }`}
                  >
                    <IconComponent
                      className={`h-4 w-4 mr-1 ${
                        typeOption?.textColor || 'text-gray-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        typeOption?.textColor || 'text-gray-600'
                      }`}
                    >
                      투자 성향:{' '}
                      {getPortfolioTypeLabel(selectedPortfolio.portfolioType)}
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {loadingSummary ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : portfolioSummary ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 총 투자금 */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600 font-medium mb-2">
                  총 투자금
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {Number(portfolioSummary.totalInvestment).toLocaleString()}원
                </p>
              </div>

              {/* 평가금액 */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm text-green-600 font-medium mb-2">
                  평가금액
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {Number(portfolioSummary.totalValue).toLocaleString()}원
                </p>
              </div>

              {/* 손익 */}
              <div
                className={`bg-gradient-to-r rounded-xl p-6 text-center ${
                  Number(portfolioSummary.totalProfitLoss) >= 0
                    ? 'from-red-50 to-red-100'
                    : 'from-blue-50 to-blue-100'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  {Number(portfolioSummary.totalProfitLoss) >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-red-600" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <p
                  className={`text-sm font-medium mb-2 ${
                    Number(portfolioSummary.totalProfitLoss) >= 0
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  손익
                </p>
                <p
                  className={`text-2xl font-bold ${
                    Number(portfolioSummary.totalProfitLoss) >= 0
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {Number(portfolioSummary.totalProfitLoss) >= 0 ? '+' : ''}
                  {Number(portfolioSummary.totalProfitLoss).toLocaleString()}원
                </p>
              </div>

              {/* 수익률 */}
              <div
                className={`bg-gradient-to-r rounded-xl p-6 text-center ${
                  Number(portfolioSummary.totalReturnRate) >= 0
                    ? 'from-red-50 to-red-100'
                    : 'from-blue-50 to-blue-100'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  <BarChart3
                    className={`h-8 w-8 ${
                      Number(portfolioSummary.totalReturnRate) >= 0
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  />
                </div>
                <p
                  className={`text-sm font-medium mb-2 ${
                    Number(portfolioSummary.totalReturnRate) >= 0
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  수익률
                </p>
                <p
                  className={`text-2xl font-bold ${
                    Number(portfolioSummary.totalReturnRate) >= 0
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                >
                  {Number(portfolioSummary.totalReturnRate) >= 0 ? '+' : ''}
                  {Number(portfolioSummary.totalReturnRate).toFixed(2)}%
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>포트폴리오 요약 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 포트폴리오 선택 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center mb-4">
          <PieChart className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">포트폴리오 선택</h2>
        </div>
        {loadingPortfolios ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>등록된 포트폴리오가 없습니다.</p>
            <p className="text-sm">새 포트폴리오를 등록해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                onClick={() => handlePortfolioSelect(portfolio)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left relative ${
                  selectedPortfolio?.id === portfolio.id
                    ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {portfolio.name || '이름 없음'}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>현재: {(portfolio.totalAmount || 0).toLocaleString()}원</p>
                  {/* 투자 성향 표시 */}
                  <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
                    {(() => {
                      const typeOption = portfolioTypeOptions.find(
                        (opt) => opt.value === portfolio.portfolioType
                      );
                      const IconComponent = typeOption?.icon || BarChart;
                      return (
                        <div
                          className={`flex items-center px-2 py-1 rounded ${
                            typeOption?.bgColor || 'bg-gray-50'
                          }`}
                        >
                          <IconComponent
                            className={`h-3 w-3 mr-1 ${
                              typeOption?.textColor || 'text-gray-600'
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              typeOption?.textColor || 'text-gray-600'
                            }`}
                          >
                            {getPortfolioTypeLabel(portfolio.portfolioType)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  {/* 현금 표시 및 수정 기능 */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    <div className="flex items-center">
                      <Wallet className="h-4 w-4 text-green-600 mr-1" />
                      {editingCash === portfolio.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editCashValue}
                            onChange={(e) => setEditCashValue(e.target.value)}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCashUpdate(portfolio.id);
                            }}
                            disabled={loadingCashUpdate}
                            className="text-green-600 hover:text-green-700 p-1"
                          >
                            {loadingCashUpdate ? (
                              <div className="w-3 h-3 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCashCancel();
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-green-600 font-medium">
                            {(portfolio.cash || 0).toLocaleString()}원
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCashEdit(portfolio);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ 수정: 포트폴리오 등록에 투자 성향 선택 UI 추가 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center mb-4">
          <Plus className="h-6 w-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">
            새 포트폴리오 등록
          </h2>
        </div>
        <div className="space-y-6">
          {/* 기본 정보 입력 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="포트폴리오 이름"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="현재 자산 (원)"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
            <input
              type="number"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              placeholder="보유 현금 (원)"
              className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* ✅ 투자 성향 선택 UI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              투자 성향 선택
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolioTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPortfolioType(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      portfolioType === option.value
                        ? `${option.bgColor} ${option.borderColor} shadow-lg transform scale-105`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent
                        className={`h-5 w-5 mr-2 ${
                          portfolioType === option.value
                            ? option.textColor
                            : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          portfolioType === option.value
                            ? option.textColor
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        portfolioType === option.value
                          ? option.textColor
                          : 'text-gray-500'
                      }`}
                    >
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 등록 버튼 */}
          <button
            onClick={handlePortfolioSubmit}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            포트폴리오 등록
          </button>
        </div>
      </div>

      {/* 종목 추가 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">종목 추가</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="종목명"
            value={newStock.name}
            onChange={(e) => setNewStock({ ...newStock, name: e.target.value })}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            disabled={!selectedPortfolio}
          />
          <input
            type="number"
            placeholder="매수가 (원)"
            value={newStock.purchasePrice}
            onChange={(e) =>
              setNewStock({ ...newStock, purchasePrice: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            disabled={!selectedPortfolio}
          />
          <input
            type="number"
            placeholder="수량"
            value={newStock.quantity}
            onChange={(e) =>
              setNewStock({ ...newStock, quantity: e.target.value })
            }
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            disabled={!selectedPortfolio}
          />
          <select
            value={newStock.term}
            onChange={(e) => setNewStock({ ...newStock, term: e.target.value })}
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
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
          className={`w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg ${
            !selectedPortfolio ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={!selectedPortfolio}
        >
          <Plus className="h-5 w-5 mr-2" />
          종목 추가
        </button>
        {!selectedPortfolio && (
          <p className="text-sm text-orange-500 mt-3 text-center">
            종목을 추가하려면 먼저 포트폴리오를 선택해주세요.
          </p>
        )}
      </div>

      {/* 종목 관리 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">종목 관리</h2>
          </div>
          <div className="flex space-x-2">
            {termTabs.map((term) => (
              <button
                key={term}
                onClick={() => setActiveTab(term)}
                className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                  activeTab === term
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={!selectedPortfolio}
              >
                {termLabels[term]}
              </button>
            ))}
          </div>
        </div>

        {!selectedPortfolio ? (
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              포트폴리오를 선택해주세요
            </h3>
            <p className="text-gray-400">
              종목을 관리하려면 먼저 포트폴리오를 선택해야 합니다.
            </p>
          </div>
        ) : loadingStocks ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : currentTabStocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500 mb-2">
              {termLabels[activeTab]} 종목이 없습니다
            </h3>
            <p className="text-gray-400">새 종목을 추가해보세요.</p>
          </div>
        ) : (
          <>
            {/* 투자 현황 요약 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                {termLabels[activeTab]} 투자 현황
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">총 투자금액</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totals.totalInvestment.toLocaleString()}원
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">평가금액</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totals.totalValue.toLocaleString()}원
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">손익</p>
                  <p
                    className={`text-2xl font-bold flex items-center justify-center ${
                      totals.totalProfitLoss >= 0
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }`}
                  >
                    {totals.totalProfitLoss >= 0 ? (
                      <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    {totals.totalProfitLoss >= 0 ? '+' : ''}
                    {totals.totalProfitLoss.toLocaleString()}원
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-sm text-gray-600 mb-2">수익률</p>
                  <p
                    className={`text-2xl font-bold ${
                      totals.totalReturnRate >= 0
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }`}
                  >
                    {totals.totalReturnRate >= 0 ? '+' : ''}
                    {totals.totalReturnRate.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* 종목 카드 리스트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentTabStocks.map((stock) => {
                const purchasePrice = stock.purchasePrice || 0;
                const currentPrice = stock.currentPrice || purchasePrice;
                const quantity = stock.quantity || 0;
                const investment = purchasePrice * quantity;
                const value = currentPrice * quantity;
                const profitLoss = value - investment;
                const returnRate =
                  investment > 0 ? (profitLoss / investment) * 100 : 0;

                const isEditing = editingStock === stock.id;

                return (
                  <div
                    key={stock.id}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                    onClick={
                      !editingStock ? () => handleStockClick(stock) : undefined
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editStock.name}
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  name: e.target.value,
                                })
                              }
                              className="w-full text-xl font-bold border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              placeholder="종목명"
                            />
                            <select
                              value={editStock.term}
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  term: e.target.value,
                                })
                              }
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            >
                              {termTabs.map((term) => (
                                <option key={term} value={term}>
                                  {termLabels[term]}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {stock.name || '이름 없음'}
                            </h3>
                            {stock.ticker && (
                              <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg inline-block">
                                {stock.ticker}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleUpdateStock}
                              className="text-green-600 hover:text-green-700 transition-colors p-2 hover:bg-green-50 rounded-lg"
                              title="수정 완료"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-500 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-lg"
                              title="수정 취소"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStock(stock)}
                              className="text-blue-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                              title="종목 수정"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStock(stock.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="종목 삭제"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {isEditing ? (
                        <>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              보유수량
                            </p>
                            <input
                              type="number"
                              value={editStock.quantity}
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  quantity: e.target.value,
                                })
                              }
                              className="w-full text-lg font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              placeholder="수량"
                            />
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">매수가</p>
                            <input
                              type="number"
                              value={editStock.purchasePrice}
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  purchasePrice: e.target.value,
                                })
                              }
                              className="w-full text-lg font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              placeholder="매수가"
                            />
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">현재가</p>
                            <input
                              type="number"
                              value={editStock.currentPrice}
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  currentPrice: e.target.value,
                                })
                              }
                              className="w-full text-lg font-semibold border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                              placeholder="현재가"
                            />
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              투자금액
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              {(
                                (editStock.purchasePrice || 0) *
                                (editStock.quantity || 0)
                              ).toLocaleString()}
                              원
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              보유수량
                            </p>
                            <p className="text-lg font-semibold">
                              {quantity.toLocaleString()}주
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">매수가</p>
                            <p className="text-lg font-semibold">
                              {purchasePrice.toLocaleString()}원
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">현재가</p>
                            <p className="text-lg font-semibold">
                              {currentPrice.toLocaleString()}원
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">
                              투자금액
                            </p>
                            <p className="text-lg font-semibold text-blue-600">
                              {investment.toLocaleString()}원
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-600 mb-1">
                              평가금액
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {value.toLocaleString()}원
                            </p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-600 mb-1">손익</p>
                            <p
                              className={`text-lg font-bold flex items-center justify-center ${
                                profitLoss >= 0
                                  ? 'text-red-500'
                                  : 'text-blue-500'
                              }`}
                            >
                              {profitLoss >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {profitLoss >= 0 ? '+' : ''}
                              {profitLoss.toLocaleString()}원
                            </p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-xs text-gray-600 mb-1">수익률</p>
                            <p
                              className={`text-lg font-bold ${
                                returnRate >= 0
                                  ? 'text-red-500'
                                  : 'text-blue-500'
                              }`}
                            >
                              {returnRate >= 0 ? '+' : ''}
                              {returnRate.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      {/* ✅ StockDetailModal 추가 */}
      {isStockDetailModalOpen && selectedStockForDetail && (
        <StockDetailModal
          stock={selectedStockForDetail}
          isOpen={isStockDetailModalOpen}
          onClose={handleCloseStockDetail}
          portfolioId={selectedPortfolio?.id}
        />
      )}
    </div>
  );
};

export default PortfolioManagement;
