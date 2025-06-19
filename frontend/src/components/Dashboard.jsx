import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Edit2,
  Check,
  PieChart as PieChartIcon,
  DollarSign,
  Target,
  Wallet,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { getToken } from '../utils/authUtils'; // authUtils에서 getToken 가져오기
import RebalancingAlert from './RebalancingAlert';
import RebalancingDetailModal from './RebalancingDetailModal';

// 애니메이션 숫자 컴포넌트
const AnimatedNumber = ({
  value,
  suffix = '',
  duration = 1500,
  isBold = false,
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const previousValue = useRef(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    previousValue.current = countRef.current;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // 이징 함수 적용 (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // 애니메이션 중간값 계산
      const currentValue =
        previousValue.current + (value - previousValue.current) * easedProgress;

      setCount(currentValue);
      countRef.current = currentValue;

      if (progress === 1) {
        clearInterval(interval);
      }
    }, 16); // 약 60fps

    return () => clearInterval(interval);
  }, [value, duration]);

  const formattedValue =
    typeof value === 'number' && !isNaN(value)
      ? `${Math.floor(count).toLocaleString()}${suffix}`
      : value;

  if (isBold) {
    return <strong>{formattedValue}</strong>;
  }

  return <span>{formattedValue}</span>;
};

// 파이 차트 라벨 렌더러
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // 값이 작은 경우 라벨을 표시하지 않음
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      fontWeight="bold"
      fontSize={10}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ textShadow: '0px 0px 3px rgba(0,0,0,0.5)' }}
    >
      {name}
    </text>
  );
};

// 활성 섹터 렌더링을 위한 컴포넌트 (통합된 툴팁)
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
    name,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={12}>
        {payload.termLabel}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        fontSize={11}
      >
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={16}
        textAnchor={textAnchor}
        fill="#999"
        fontSize={10}
      >
        {`${value.toLocaleString()}원 `}
        <tspan fontWeight="bold">({(percent * 100).toFixed(1)}%)</tspan>
      </text>
    </g>
  );
};

// 커스텀 레전드 렌더러
const CustomizedLegend = ({ payload }) => {
  return (
    <ul className="flex flex-wrap justify-center gap-3 text-xs mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <div
            className="w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const Dashboard = () => {
  // 포트폴리오 데이터
  const [portfolioData, setPortfolioData] = useState({
    targetAmount: 100000000,
    currentAmount: 0,
    investedAmount: 0,
    cash: 0,
    dailyReturn: 0,
    yesterdayAmount: 0,
    goalPeriod: {
      value: 1,
      unit: 'year',
    },
    targetAllocation: {
      stock: 70,
      cash: 30,
    },
  });

  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [primaryPortfolioId, setPrimaryPortfolioId] = useState(null);
  const [showRebalancingDetailModal, setShowRebalancingDetailModal] =
    useState(false);
  const [rebalancingDetailData, setRebalancingDetailData] = useState(null);
  const [showHealthModal, setShowHealthModal] = useState(false); // 건강도 모달 상태 추가
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState({
    amount: portfolioData.targetAmount,
    period: { ...portfolioData.goalPeriod },
    allocation: { ...portfolioData.targetAllocation },
  });
  const [stocksData, setStocksData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showDetailedChart, setShowDetailedChart] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // 목표 기간 옵션
  const periodOptions = [
    { value: 'month', label: '개월' },
    { value: 'year', label: '년' },
    { value: 'quarter', label: '분기' },
    { value: 'custom', label: '직접 입력' },
  ];

  // 리밸런싱 상세 보기 핸들러
  const handleViewRebalancingDetails = (rebalancingData) => {
    setRebalancingDetailData(rebalancingData);
    setShowRebalancingDetailModal(true);
  };

  // 현재 자산 배분 비율 계산
  const getCurrentAllocation = () => {
    const totalAssets = portfolioData.currentAmount;
    if (totalAssets === 0) return { stock: 0, cash: 0 };

    const stockValue = totalAssets - portfolioData.cash;
    const stockRatio = (stockValue / totalAssets) * 100;
    const cashRatio = (portfolioData.cash / totalAssets) * 100;

    return {
      stock: stockRatio,
      cash: cashRatio,
    };
  };

  const currentAllocation = getCurrentAllocation();

  // 자산 배분 슬라이더 핸들러
  const handleAllocationChange = (stockPercentage) => {
    const cashPercentage = 100 - stockPercentage;
    setEditedGoal({
      ...editedGoal,
      allocation: {
        stock: stockPercentage,
        cash: cashPercentage,
      },
    });
  };

  // 현금 데이터
  const cashData = [
    {
      name: '현금',
      value: portfolioData.cash,
      term: 'cash',
      termLabel: '현금',
      color: '#FF8042',
    },
  ];

  // 모든 데이터 합치기
  const allAssetsData = [...stocksData, ...cashData];

  // 기간별 합계 계산
  const termTotals = {
    short: stocksData
      .filter((item) => item.term === 'short')
      .reduce((sum, item) => sum + item.value, 0),
    mid: stocksData
      .filter((item) => item.term === 'mid')
      .reduce((sum, item) => sum + item.value, 0),
    long: stocksData
      .filter((item) => item.term === 'long')
      .reduce((sum, item) => sum + item.value, 0),
    cash: portfolioData.cash,
  };

  // 기간별 요약 데이터
  const termSummaryData = [
    {
      name: '단기',
      value: termTotals.short,
      termLabel: '단기',
      color: '#0088FE',
    },
    {
      name: '중기',
      value: termTotals.mid,
      termLabel: '중기',
      color: '#8884d8',
    },
    {
      name: '장기',
      value: termTotals.long,
      termLabel: '장기',
      color: '#a4de6c',
    },
    {
      name: '현금',
      value: termTotals.cash,
      termLabel: '현금',
      color: '#FF8042',
    },
  ];

  // API 호출 함수들
  const fetchPortfolioData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch('http://localhost:8080/api/portfolios', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Portfolio API Response:', data);

      setPortfolios(data);

      if (data && data.length > 0) {
        setPrimaryPortfolioId(data[0].id);

        const firstPortfolio = data[0];
        const totalAssets = data.reduce((sum, portfolio) => {
          return sum + (portfolio.totalAmount || 0);
        }, 0);

        const totalCash = data.reduce((sum, portfolio) => {
          return sum + (portfolio.cash || 0);
        }, 0);

        const yesterdayAmount = totalAssets * 0.98;
        const dailyReturn =
          totalAssets > 0
            ? ((totalAssets - yesterdayAmount) / yesterdayAmount) * 100
            : 0;

        setPortfolioData((prev) => ({
          ...prev,
          targetAmount: firstPortfolio.targetAmount || 100000000,
          currentAmount: totalAssets,
          cash: totalCash,
          yesterdayAmount: yesterdayAmount,
          dailyReturn: parseFloat(dailyReturn.toFixed(2)),
          targetAllocation: {
            stock: firstPortfolio.targetStockRatio || 70,
            cash: firstPortfolio.targetCashRatio || 30,
          },
        }));

        setEditedGoal((prev) => ({
          ...prev,
          amount: firstPortfolio.targetAmount || 100000000,
          allocation: {
            stock: firstPortfolio.targetStockRatio || 70,
            cash: firstPortfolio.targetCashRatio || 30,
          },
        }));
      }
    } catch (err) {
      console.error('포트폴리오 데이터 로드 실패:', err);
      setError(err.message);
    }
  }, []);

  const fetchStocksData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const allStocks = [];

      for (const portfolio of portfolios) {
        try {
          const assetsResponse = await fetch(
            `http://localhost:8080/api/portfolios/${portfolio.id}/stocks`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (assetsResponse.ok) {
            const assets = await assetsResponse.json();

            assets.forEach((asset, index) => {
              const colors = [
                '#0088FE',
                '#00C49F',
                '#FFBB28',
                '#8884d8',
                '#83a6ed',
                '#a4de6c',
                '#d0ed57',
              ];
              const colorIndex = index % colors.length;

              let termLabel = '중기';
              switch (asset.term) {
                case 'short':
                  termLabel = '단기';
                  break;
                case 'long':
                  termLabel = '장기';
                  break;
                case 'mid':
                default:
                  termLabel = '중기';
                  break;
              }

              allStocks.push({
                name: asset.name || '알 수 없는 종목',
                value: asset.totalValue || 0,
                term: asset.term || 'mid',
                termLabel: termLabel,
                returnRate: asset.returnRate || 0,
                color: colors[colorIndex],
              });
            });
          }
        } catch (assetError) {
          console.warn(
            `포트폴리오 ${portfolio.id}의 자산 로드 실패:`,
            assetError
          );
        }
      }

      setStocksData(allStocks);
    } catch (err) {
      console.error('종목 데이터 로드 실패:', err);
      setError(err.message);
    }
  }, [portfolios]);

  // 진행 바 애니메이션
  const progressPercentage =
    portfolioData.targetAmount > 0
      ? (portfolioData.currentAmount / portfolioData.targetAmount) * 100
      : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(progressPercentage);
    }, 500);

    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await fetchPortfolioData();
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchPortfolioData]);

  useEffect(() => {
    if (portfolios.length > 0) {
      fetchStocksData();
    }
  }, [portfolios, fetchStocksData]);

  // 활성 인덱스 설정 핸들러
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // 목표 편집 제출 핸들러
  const handleGoalSubmit = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const portfolioId =
        primaryPortfolioId || (portfolios.length > 0 ? portfolios[0].id : null);

      if (!portfolioId) {
        throw new Error('포트폴리오를 찾을 수 없습니다.');
      }

      const response = await fetch(
        `http://localhost:8080/api/portfolios/${portfolioId}/target`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetAmount: editedGoal.amount,
            targetStockRatio: editedGoal.allocation.stock,
            targetCashRatio: editedGoal.allocation.cash,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPortfolioData((prev) => ({
        ...prev,
        targetAmount: editedGoal.amount,
        goalPeriod: { ...editedGoal.period },
        targetAllocation: { ...editedGoal.allocation },
      }));

      setIsEditingGoal(false);

      console.log('목표 설정이 성공적으로 업데이트되었습니다.');
    } catch (err) {
      console.error('목표 설정 업데이트 실패:', err);
      setError('목표 설정 업데이트에 실패했습니다: ' + err.message);
    }
  }, [editedGoal, primaryPortfolioId, portfolios]);

  // 목표 편집 취소 핸들러
  const handleEditCancel = useCallback(() => {
    setEditedGoal({
      amount: portfolioData.targetAmount,
      period: { ...portfolioData.goalPeriod },
      allocation: { ...portfolioData.targetAllocation },
    });
    setIsEditingGoal(false);
  }, [
    portfolioData.targetAmount,
    portfolioData.goalPeriod,
    portfolioData.targetAllocation,
  ]);

  // 기간 단위에 따른 표시 텍스트
  const getPeriodText = useCallback((period) => {
    switch (period.unit) {
      case 'year':
        return period.value > 1 ? `${period.value}년` : '1년';
      case 'month':
        return period.value > 1 ? `${period.value}개월` : '1개월';
      case 'quarter':
        return period.value > 1 ? `${period.value}분기` : '1분기';
      case 'custom':
        return '사용자 정의';
      default:
        return '1년';
    }
  }, []);

  // 커스텀 레전드 데이터 생성
  const getCustomLegendPayload = useCallback((data) => {
    return data.map((item) => ({
      value: item.name,
      color: item.color,
    }));
  }, []);

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 mt-1">
            포트폴리오 자산의 전체 현황을 확인할 수 있습니다.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 mt-1">
            포트폴리오 자산의 전체 현황을 확인할 수 있습니다.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              데이터 로드 실패
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-gray-500 mt-1">
          포트폴리오 자산의 전체 현황을 확인할 수 있습니다.
        </p>
      </div>

      {/* 리밸런싱 알림 - 작게 만들기 */}
      <div className="relative">
        <RebalancingAlert
          portfolioId={
            primaryPortfolioId || (portfolios.length > 0 ? portfolios[0].id : 1)
          }
          onViewDetails={handleViewRebalancingDetails}
          compact={true}
        />
      </div>

      {/* 격자 레이아웃 시작 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 왼쪽 메인 영역 (9칸) */}
        <div className="lg:col-span-9 space-y-6">
          {/* 현재 자산 및 목표 카드 */}
          <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
            {/* 수익률 피드백 알림 */}
            {portfolioData.dailyReturn > 0 && (
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg flex items-center shadow text-sm">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{portfolioData.dailyReturn}%</span>
              </div>
            )}

            {portfolioData.dailyReturn < 0 && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg flex items-center shadow text-sm">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span>{portfolioData.dailyReturn}%</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* 현재 자산 */}
              <div>
                <div className="flex items-center mb-2">
                  <Wallet className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    현재 자산
                  </h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  <AnimatedNumber
                    value={portfolioData.currentAmount}
                    suffix="원"
                  />
                </p>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <PieChartIcon className="w-3 h-3 mr-1 text-blue-500" />
                      <span>주식 {currentAllocation.stock.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1 text-orange-500" />
                      <span>현금 {currentAllocation.cash.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 투자 목표 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      투자 목표
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditingGoal(!isEditingGoal)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    type="button"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                {isEditingGoal ? (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                    {/* 목표 금액 입력 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        목표 금액
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editedGoal.amount}
                          onChange={(e) =>
                            setEditedGoal({
                              ...editedGoal,
                              amount: Number(e.target.value),
                            })
                          }
                          className="p-2 border rounded-md w-32 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-500">원</span>
                      </div>
                    </div>

                    {/* 달성 기간 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        달성 기간
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editedGoal.period.value}
                          onChange={(e) =>
                            setEditedGoal({
                              ...editedGoal,
                              period: {
                                ...editedGoal.period,
                                value: Number(e.target.value),
                              },
                            })
                          }
                          min="1"
                          className="p-2 border rounded-md w-16 text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        />
                        <select
                          value={editedGoal.period.unit}
                          onChange={(e) =>
                            setEditedGoal({
                              ...editedGoal,
                              period: {
                                ...editedGoal.period,
                                unit: e.target.value,
                              },
                            })
                          }
                          className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        >
                          {periodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 자산 배분 */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        자산 배분
                      </label>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">주식</span>
                          <input
                            type="number"
                            value={editedGoal.allocation.stock}
                            onChange={(e) => {
                              const value = Math.max(
                                0,
                                Math.min(100, Number(e.target.value))
                              );
                              handleAllocationChange(value);
                            }}
                            min="0"
                            max="100"
                            className="w-12 p-1 text-xs border rounded focus:ring-1 focus:ring-blue-300"
                          />
                          <span className="text-xs">%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">현금</span>
                          <input
                            type="number"
                            value={editedGoal.allocation.cash}
                            onChange={(e) => {
                              const value = Math.max(
                                0,
                                Math.min(100, Number(e.target.value))
                              );
                              handleAllocationChange(100 - value);
                            }}
                            min="0"
                            max="100"
                            className="w-12 p-1 text-xs border rounded focus:ring-1 focus:ring-blue-300"
                          />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={handleEditCancel}
                        className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        type="button"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleGoalSubmit}
                        className="px-2 py-1 text-xs text-white bg-blue-500 rounded-md hover:bg-blue-600 flex items-center transition-colors"
                        type="button"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-green-600 mb-2">
                      <AnimatedNumber
                        value={portfolioData.targetAmount}
                        suffix="원"
                      />
                    </p>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span>
                          {getPeriodText(portfolioData.goalPeriod)} 목표
                        </span>
                      </div>
                      <div className="text-xs">
                        목표: 주식 {portfolioData.targetAllocation.stock}% /
                        현금 {portfolioData.targetAllocation.cash}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1500 ease-out"
                  style={{ width: `${Math.min(progressWidth, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <p>
                  목표 달성률{' '}
                  <strong>
                    <AnimatedNumber
                      value={progressPercentage}
                      duration={1000}
                      suffix="%"
                    />
                  </strong>
                </p>
                <p>
                  남은 금액:{' '}
                  <AnimatedNumber
                    value={Math.max(
                      0,
                      portfolioData.targetAmount - portfolioData.currentAmount
                    )}
                    suffix="원"
                  />
                </p>
              </div>
            </div>
          </div>

          {/* 자산 구성 차트 */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">자산 구성</h2>
              <button
                onClick={() => setShowDetailedChart(!showDetailedChart)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                type="button"
              >
                {showDetailedChart ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    기간별 보기
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    종목별 보기
                  </>
                )}
              </button>
            </div>

            {allAssetsData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {showDetailedChart ? (
                        <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={allAssetsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                          onMouseLeave={onPieLeave}
                          animationDuration={1000}
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {allAssetsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      ) : (
                        <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={termSummaryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                          onMouseLeave={onPieLeave}
                          animationDuration={1000}
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {termSummaryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <CustomizedLegend
                  payload={getCustomLegendPayload(
                    showDetailedChart ? allAssetsData : termSummaryData
                  )}
                />
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">📊</p>
                  <p>아직 등록된 자산이 없습니다.</p>
                  <p className="text-sm">
                    포트폴리오 관리에서 자산을 추가해보세요!
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center text-xs text-gray-500">
              <Info className="h-3 w-3 mr-1" />
              <p>차트에 마우스를 올리면 상세 정보를 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 오른쪽 사이드 영역 (3칸) */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {/* 포트폴리오 건강도 카드 - 최상단 배치 */}
          <div
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200 mb-6"
            onClick={() => setShowHealthModal(true)}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  포트폴리오 건강도
                </h3>
              </div>

              <div className="mb-3">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  78점
                </div>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  우수
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                평균보다 높은 수준의 건강한 포트폴리오
              </div>

              <div className="text-xs text-blue-600 font-medium flex items-center justify-center">
                👆 클릭하여 상세보기
              </div>
            </div>
          </div>

          {/* 투자 기간별 요약 카드들 */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* 단기 투자 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-700">
                  단기 투자
                </h3>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              </div>
              <p className="text-lg font-bold text-blue-600 mb-1">
                <AnimatedNumber value={termTotals.short} suffix="원" />
              </p>
              <p className="text-xs text-blue-600">
                전체의{' '}
                <strong>
                  {portfolioData.currentAmount > 0
                    ? (
                        (termTotals.short / portfolioData.currentAmount) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </strong>
              </p>
            </div>

            {/* 중기 투자 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-purple-700">
                  중기 투자
                </h3>
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              </div>
              <p className="text-lg font-bold text-purple-600 mb-1">
                <AnimatedNumber value={termTotals.mid} suffix="원" />
              </p>
              <p className="text-xs text-purple-600">
                전체의{' '}
                <strong>
                  {portfolioData.currentAmount > 0
                    ? (
                        (termTotals.mid / portfolioData.currentAmount) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </strong>
              </p>
            </div>

            {/* 장기 투자 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-700">
                  장기 투자
                </h3>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="text-lg font-bold text-green-600 mb-1">
                <AnimatedNumber value={termTotals.long} suffix="원" />
              </p>
              <p className="text-xs text-green-600">
                전체의{' '}
                <strong>
                  {portfolioData.currentAmount > 0
                    ? (
                        (termTotals.long / portfolioData.currentAmount) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </strong>
              </p>
            </div>

            {/* 보유 현금 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-orange-700">
                  보유 현금
                </h3>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              </div>
              <p className="text-lg font-bold text-orange-600 mb-1">
                <AnimatedNumber value={termTotals.cash} suffix="원" />
              </p>
              <p className="text-xs text-orange-600">
                전체의{' '}
                <strong>
                  {portfolioData.currentAmount > 0
                    ? (
                        (termTotals.cash / portfolioData.currentAmount) *
                        100
                      ).toFixed(1)
                    : '0'}
                  %
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 포트폴리오 건강도 상세 모달 */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                포트폴리오 건강도
              </h2>
              <button
                onClick={() => setShowHealthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* 전체 건강도 점수 */}
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  78점
                </div>
                <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full mb-2">
                  우수
                </span>
                <p className="text-sm text-gray-600">
                  평균보다 높은 수준의 건강한 포트폴리오입니다.
                </p>
              </div>

              {/* 다양성 점수 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">다양성</span>
                  <span className="text-sm font-semibold text-green-600">
                    우수
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: '80%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  여러 투자 기간과 자산에 분산 투자가 잘 되어 있습니다.
                </p>
              </div>

              {/* 리스크 레벨 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">리스크</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    보통
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: '60%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  현재 포트폴리오의 리스크 수준은 적절한 범위 내에 있습니다.
                </p>
              </div>

              {/* 밸런스 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">밸런스</span>
                  <span className="text-sm font-semibold text-blue-600">
                    양호
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  주식과 현금의 배분이 목표 비율에 근접해 있습니다.
                </p>
              </div>

              {/* 개선 제안 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                  💡 개선 제안
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    장기 투자 비중을 조금 더 늘려보세요
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    현금 비율이 목표보다 높습니다
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    다음 리밸런싱 시기: 2주 후
                  </li>
                </ul>
              </div>

              {/* 닫기 버튼 */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowHealthModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 리밸런싱 상세 모달 */}
      <RebalancingDetailModal
        isOpen={showRebalancingDetailModal}
        onClose={() => setShowRebalancingDetailModal(false)}
        rebalancingData={rebalancingDetailData}
      />
    </div>
  );
};

export default Dashboard;
