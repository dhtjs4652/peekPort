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
  ChevronRight,
} from 'lucide-react';

const PortfolioManagement = () => {
  // 모든 상태 관리
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('short');
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [editingCash, setEditingCash] = useState(null);
  const [editCashValue, setEditCashValue] = useState('');
  const [loadingCashUpdate, setLoadingCashUpdate] = useState(false);
  const [selectedStockForDetail, setSelectedStockForDetail] = useState(null);
  const [isStockDetailModalOpen, setIsStockDetailModalOpen] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showStockForm, setShowStockForm] = useState(false);
  const [newStock, setNewStock] = useState({
    name: '',
    purchasePrice: '',
    quantity: '',
    term: 'short',
  });
  const [editingStock, setEditingStock] = useState(null);
  const [editStock, setEditStock] = useState({
    name: '',
    purchasePrice: '',
    quantity: '',
    currentPrice: '',
    term: 'short',
  });

  // 투자 성향 옵션
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

  const getPortfolioTypeLabel = (type) => {
    const option = portfolioTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  // 핸들러 함수들
  const handleStockClick = (stock) => {
    setSelectedStockForDetail(stock);
    setIsStockDetailModalOpen(true);
  };

  const handleCloseStockDetail = () => {
    setIsStockDetailModalOpen(false);
    setSelectedStockForDetail(null);
  };

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
    } catch {
      setError('현금 업데이트에 실패했습니다.');
    } finally {
      setLoadingCashUpdate(false);
    }
  };

  const handleCashCancel = () => {
    setEditingCash(null);
    setEditCashValue('');
  };

  // API 함수들
  const fetchPortfolioSummary = async (portfolioId) => {
    if (!portfolioId) return;
    try {
      setLoadingSummary(true);
      const response = await authAxios.get(
        `/api/portfolios/${portfolioId}/summary`
      );
      setPortfolioSummary(response.data);
    } catch {
      setPortfolioSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

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
        const firstPortfolio = portfolioData[0];
        setSelectedPortfolio(firstPortfolio);
        if (firstPortfolio.id) {
          fetchStocksByPortfolioId(firstPortfolio.id);
          fetchPortfolioSummary(firstPortfolio.id);
        }
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
      const response = await authAxios.get(
        `/api/portfolios/${portfolioId}/stocks`
      );
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

  const handlePortfolioSelect = (portfolio) => {
    setSelectedPortfolio(portfolio);
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
      setShowPortfolioForm(false);
      fetchPortfolios();
    } catch {
      setError('포트폴리오 등록에 실패했습니다.');
    }
  };

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
      setShowStockForm(false);
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

  // 계산 및 상수
  const termTabs = ['short', 'mid', 'long'];
  const termLabels = { short: '단기', mid: '중기', long: '장기' };
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                포트폴리오 관리
              </h1>
              <p className="text-gray-600 mt-2">
                투자 종목을 체계적으로 관리하고 수익률을 확인하세요
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPortfolioForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />새 포트폴리오
              </button>
              {selectedPortfolio && (
                <button
                  onClick={() => setShowStockForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  종목 추가
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
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

        {successMessage && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg flex items-center shadow-xl z-50 animate-bounce">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
          </div>
        )}

        {/* 포트폴리오 선택 */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-6 w-6 text-blue-600 mr-2" />
            포트폴리오 선택
          </h2>
          {loadingPortfolios ? (
            <div className="flex justify-center items-center h-32 bg-white rounded-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : portfolios.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                등록된 포트폴리오가 없습니다
              </h3>
              <p className="text-gray-400 mb-6">
                새 포트폴리오를 등록해서 투자 관리를 시작해보세요
              </p>
              <button
                onClick={() => setShowPortfolioForm(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center mx-auto font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />첫 포트폴리오 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  onClick={() => handlePortfolioSelect(portfolio)}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                    selectedPortfolio?.id === portfolio.id
                      ? 'border-blue-500 shadow-lg transform scale-105'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {portfolio.name || '이름 없음'}
                    </h3>
                    {selectedPortfolio?.id === portfolio.id && (
                      <div className="bg-blue-100 p-2 rounded-full">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 자산</span>
                      <span className="font-semibold">
                        {(portfolio.totalAmount || 0).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">현금</span>
                      <div className="flex items-center">
                        {editingCash === portfolio.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editCashValue}
                              onChange={(e) => setEditCashValue(e.target.value)}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-400"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCashUpdate(portfolio.id);
                              }}
                              disabled={loadingCashUpdate}
                              className="text-green-600 hover:text-green-700"
                            >
                              {loadingCashUpdate ? (
                                <div className="w-4 h-4 border border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCashCancel();
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-semibold text-green-600 mr-2">
                              {(portfolio.cash || 0).toLocaleString()}원
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCashEdit(portfolio);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      {(() => {
                        const typeOption = portfolioTypeOptions.find(
                          (opt) => opt.value === portfolio.portfolioType
                        );
                        const IconComponent = typeOption?.icon || BarChart;
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">투자 성향</span>
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
                                {getPortfolioTypeLabel(portfolio.portfolioType)}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 선택된 포트폴리오 상세 */}
        {selectedPortfolio && (
          <div className="space-y-8">
            {/* 요약 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-6 w-6 text-blue-600 mr-2" />
                  {selectedPortfolio.name} 투자 현황
                </h2>
                <div className="flex items-center text-sm text-gray-600">
                  <span>마지막 업데이트: 방금 전</span>
                </div>
              </div>
              {loadingSummary ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : portfolioSummary ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-blue-600 font-medium mb-1">총 투자금</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {Number(
                        portfolioSummary.totalInvestment
                      ).toLocaleString()}
                    </p>
                    <p className="text-blue-600 text-sm">원</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                    <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="text-green-600 font-medium mb-1">평가금액</p>
                    <p className="text-2xl font-bold text-green-700">
                      {Number(portfolioSummary.totalValue).toLocaleString()}
                    </p>
                    <p className="text-green-600 text-sm">원</p>
                  </div>
                  <div
                    className={`bg-gradient-to-br rounded-xl p-6 text-center ${
                      Number(portfolioSummary.totalProfitLoss) >= 0
                        ? 'from-red-50 to-red-100'
                        : 'from-blue-50 to-blue-100'
                    }`}
                  >
                    {Number(portfolioSummary.totalProfitLoss) >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-3" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    )}
                    <p
                      className={`font-medium mb-1 ${
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
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {Number(portfolioSummary.totalProfitLoss) >= 0 ? '+' : ''}
                      {Number(
                        portfolioSummary.totalProfitLoss
                      ).toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${
                        Number(portfolioSummary.totalProfitLoss) >= 0
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      원
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br rounded-xl p-6 text-center ${
                      Number(portfolioSummary.totalReturnRate) >= 0
                        ? 'from-red-50 to-red-100'
                        : 'from-blue-50 to-blue-100'
                    }`}
                  >
                    <BarChart3
                      className={`h-8 w-8 mx-auto mb-3 ${
                        Number(portfolioSummary.totalReturnRate) >= 0
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <p
                      className={`font-medium mb-1 ${
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
                          ? 'text-red-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {Number(portfolioSummary.totalReturnRate) >= 0 ? '+' : ''}
                      {Number(portfolioSummary.totalReturnRate).toFixed(2)}
                    </p>
                    <p
                      className={`text-sm ${
                        Number(portfolioSummary.totalReturnRate) >= 0
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>포트폴리오 요약 정보를 불러올 수 없습니다.</p>
                </div>
              )}
            </div>

            {/* 종목 관리 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
                    종목 관리
                  </h2>
                  <div className="flex space-x-2">
                    {termTabs.map((term) => (
                      <button
                        key={term}
                        onClick={() => setActiveTab(term)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === term
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {termLabels[term]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loadingStocks ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : currentTabStocks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-6">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-500 mb-2">
                      {termLabels[activeTab]} 종목이 없습니다
                    </h3>
                    <p className="text-gray-400 mb-6">
                      새 종목을 추가해서 포트폴리오를 구성해보세요
                    </p>
                    <button
                      onClick={() => setShowStockForm(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center mx-auto font-medium"
                    >
                      <Plus className="h-5 w-5 mr-2" />첫 종목 추가하기
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 투자 현황 요약 */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        {termLabels[activeTab]} 투자 현황
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">
                            총 투자금액
                          </p>
                          <p className="text-xl font-bold text-blue-600">
                            {totals.totalInvestment.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">평가금액</p>
                          <p className="text-xl font-bold text-green-600">
                            {totals.totalValue.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">손익</p>
                          <p
                            className={`text-xl font-bold flex items-center justify-center ${
                              totals.totalProfitLoss >= 0
                                ? 'text-red-500'
                                : 'text-blue-500'
                            }`}
                          >
                            {totals.totalProfitLoss >= 0 ? (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {totals.totalProfitLoss >= 0 ? '+' : ''}
                            {totals.totalProfitLoss.toLocaleString()}원
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">수익률</p>
                          <p
                            className={`text-xl font-bold ${
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

                    {/* 종목 리스트 */}
                    <div className="space-y-4">
                      {currentTabStocks.map((stock) => {
                        const purchasePrice = stock.purchasePrice || 0;
                        const currentPrice =
                          stock.currentPrice || purchasePrice;
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
                            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-blue-300"
                            onClick={
                              !editingStock
                                ? () => handleStockClick(stock)
                                : undefined
                            }
                          >
                            <div className="flex items-center justify-between mb-4">
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                      {stock.name || '이름 없음'}
                                    </h3>
                                    {stock.ticker && (
                                      <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                                        {stock.ticker}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={handleUpdateStock}
                                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                                      title="수정 완료"
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
                                      title="수정 취소"
                                    >
                                      <X className="h-5 w-5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditStock(stock);
                                      }}
                                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                      title="종목 수정"
                                    >
                                      <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteStock(stock.id);
                                      }}
                                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                      title="종목 삭제"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {isEditing ? (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      수량
                                    </label>
                                    <input
                                      type="number"
                                      value={editStock.quantity}
                                      onChange={(e) =>
                                        setEditStock({
                                          ...editStock,
                                          quantity: e.target.value,
                                        })
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400"
                                      placeholder="수량"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      매수가
                                    </label>
                                    <input
                                      type="number"
                                      value={editStock.purchasePrice}
                                      onChange={(e) =>
                                        setEditStock({
                                          ...editStock,
                                          purchasePrice: e.target.value,
                                        })
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400"
                                      placeholder="매수가"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      현재가
                                    </label>
                                    <input
                                      type="number"
                                      value={editStock.currentPrice}
                                      onChange={(e) =>
                                        setEditStock({
                                          ...editStock,
                                          currentPrice: e.target.value,
                                        })
                                      }
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-400"
                                      placeholder="현재가"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      투자금액
                                    </label>
                                    <p className="text-lg font-semibold text-blue-600 pt-2">
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
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                      수량
                                    </p>
                                    <p className="text-lg font-semibold">
                                      {quantity.toLocaleString()}주
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                      매수가
                                    </p>
                                    <p className="text-lg font-semibold">
                                      {purchasePrice.toLocaleString()}원
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                      현재가
                                    </p>
                                    <p className="text-lg font-semibold">
                                      {currentPrice.toLocaleString()}원
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">
                                      손익
                                    </p>
                                    <p
                                      className={`text-lg font-semibold ${
                                        profitLoss >= 0
                                          ? 'text-red-500'
                                          : 'text-blue-500'
                                      }`}
                                    >
                                      {profitLoss >= 0 ? '+' : ''}
                                      {profitLoss.toLocaleString()}원
                                    </p>
                                    <p
                                      className={`text-sm ${
                                        profitLoss >= 0
                                          ? 'text-red-500'
                                          : 'text-blue-500'
                                      }`}
                                    >
                                      ({returnRate >= 0 ? '+' : ''}
                                      {returnRate.toFixed(2)}%)
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 포트폴리오 추가 모달 */}
      {showPortfolioForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                새 포트폴리오 등록
              </h3>
              <button
                onClick={() => setShowPortfolioForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  포트폴리오 이름
                </label>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="예: 메인 포트폴리오"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 자산 (원)
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="10000000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보유 현금 (원)
                </label>
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="1000000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  투자 성향
                </label>
                <div className="space-y-3">
                  {portfolioTypeOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPortfolioType(option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                          portfolioType === option.value
                            ? `${option.bgColor} ${option.borderColor}`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <IconComponent
                            className={`h-5 w-5 mr-3 ${
                              portfolioType === option.value
                                ? option.textColor
                                : 'text-gray-400'
                            }`}
                          />
                          <div>
                            <span
                              className={`font-semibold ${
                                portfolioType === option.value
                                  ? option.textColor
                                  : 'text-gray-700'
                              }`}
                            >
                              {option.label}
                            </span>
                            <p
                              className={`text-sm ${
                                portfolioType === option.value
                                  ? option.textColor
                                  : 'text-gray-500'
                              }`}
                            >
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowPortfolioForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium"
              >
                취소
              </button>
              <button
                onClick={handlePortfolioSubmit}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all duration-300 font-medium"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 종목 추가 모달 */}
      {showStockForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">새 종목 추가</h3>
              <button
                onClick={() => setShowStockForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  종목명
                </label>
                <input
                  type="text"
                  placeholder="예: 삼성전자"
                  value={newStock.name}
                  onChange={(e) =>
                    setNewStock({ ...newStock, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  매수가 (원)
                </label>
                <input
                  type="number"
                  placeholder="75000"
                  value={newStock.purchasePrice}
                  onChange={(e) =>
                    setNewStock({ ...newStock, purchasePrice: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수량
                </label>
                <input
                  type="number"
                  placeholder="10"
                  value={newStock.quantity}
                  onChange={(e) =>
                    setNewStock({ ...newStock, quantity: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투자 기간
                </label>
                <select
                  value={newStock.term}
                  onChange={(e) =>
                    setNewStock({ ...newStock, term: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                >
                  {termTabs.map((term) => (
                    <option key={term} value={term}>
                      {termLabels[term]}
                    </option>
                  ))}
                </select>
              </div>
              {newStock.purchasePrice && newStock.quantity && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">총 투자금액</p>
                  <p className="text-xl font-bold text-blue-700">
                    {(
                      Number(newStock.purchasePrice) * Number(newStock.quantity)
                    ).toLocaleString()}
                    원
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowStockForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddStock}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 종목 상세 모달 */}
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
