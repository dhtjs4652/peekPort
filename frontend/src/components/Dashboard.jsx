import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Edit2,
  Check,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { getToken } from '../utils/authUtils'; // authUtils에서 getToken 가져오기

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
      fontSize={11}
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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={14}>
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
        fontSize={12}
      >
        {name}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
        fontSize={12}
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
    <ul className="flex flex-wrap justify-center gap-4 text-sm mt-2">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const Dashboard = () => {
  // 포트폴리오 데이터 - 이제 API에서 가져올 예정
  const [portfolioData, setPortfolioData] = useState({
    targetAmount: 100000000,
    currentAmount: 0, // API에서 로드될 때까지 0
    investedAmount: 0,
    cash: 0,
    dailyReturn: 0,
    yesterdayAmount: 0,
    goalPeriod: {
      value: 1,
      unit: 'year',
    },
  });

  // 로딩 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 목표 설정 편집 상태
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState({
    amount: portfolioData.targetAmount,
    period: { ...portfolioData.goalPeriod },
  });

  // 목표 기간 옵션
  const periodOptions = [
    { value: 'month', label: '개월' },
    { value: 'year', label: '년' },
    { value: 'quarter', label: '분기' },
    { value: 'custom', label: '직접 입력' },
  ];

  // 종목별 데이터 (API에서 로드)
  const [stocksData, setStocksData] = useState([]);

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

  const [activeIndex, setActiveIndex] = useState(null);
  const [showDetailedChart, setShowDetailedChart] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // API 호출 함수들
  const fetchPortfolioData = async () => {
    try {
      const token = getToken(); // authUtils의 getToken 사용
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

      if (data && data.length > 0) {
        // 모든 포트폴리오의 총 자산 합계 계산
        const totalAssets = data.reduce((sum, portfolio) => {
          return sum + (portfolio.totalAmount || 0);
        }, 0);

        // 모든 포트폴리오의 현금 합계 계산
        const totalCash = data.reduce((sum, portfolio) => {
          return sum + (portfolio.cash || 0);
        }, 0);

        // 어제 금액 계산 (예시로 현재 금액의 98%로 설정)
        const yesterdayAmount = totalAssets * 0.98;
        const dailyReturn =
          totalAssets > 0
            ? ((totalAssets - yesterdayAmount) / yesterdayAmount) * 100
            : 0;

        setPortfolioData((prev) => ({
          ...prev,
          currentAmount: totalAssets,
          cash: totalCash,
          yesterdayAmount: yesterdayAmount,
          dailyReturn: parseFloat(dailyReturn.toFixed(2)),
        }));
      }
    } catch (err) {
      console.error('포트폴리오 데이터 로드 실패:', err);
      setError(err.message);
    }
  };

  const fetchStocksData = async () => {
    try {
      const token = getToken(); // authUtils의 getToken 사용
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      // 모든 포트폴리오 가져오기
      const portfoliosResponse = await fetch(
        'http://localhost:8080/api/portfolios',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!portfoliosResponse.ok) {
        throw new Error(`HTTP error! status: ${portfoliosResponse.status}`);
      }

      const portfolios = await portfoliosResponse.json();
      const allStocks = [];

      // 각 포트폴리오의 자산들을 가져오기
      for (const portfolio of portfolios) {
        try {
          const assetsResponse = await fetch(
            `http://localhost:8080/api/assets/portfolio/${portfolio.id}`,
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

            // 자산 데이터를 차트 형식으로 변환
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

              // 투자 기간에 따른 분류 (예시 로직)
              let term = 'mid';
              let termLabel = '중기';

              if (asset.stockName && asset.stockName.includes('ETF')) {
                term = 'long';
                termLabel = '장기';
              } else if (asset.quantity > 100) {
                term = 'short';
                termLabel = '단기';
              }

              allStocks.push({
                name: asset.stockName || '알 수 없는 종목',
                value: asset.evaluationAmount || 0,
                term: term,
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
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchPortfolioData(), fetchStocksData()]);
      } catch (err) {
        console.error('데이터 로드 실패:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 활성 인덱스 설정 핸들러
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // 목표 편집 제출 핸들러
  const handleGoalSubmit = () => {
    setPortfolioData({
      ...portfolioData,
      targetAmount: editedGoal.amount,
      goalPeriod: { ...editedGoal.period },
    });
    setIsEditingGoal(false);
  };

  // 목표 편집 취소 핸들러
  const handleEditCancel = () => {
    setEditedGoal({
      amount: portfolioData.targetAmount,
      period: { ...portfolioData.goalPeriod },
    });
    setIsEditingGoal(false);
  };

  // 기간 단위에 따른 표시 텍스트
  const getPeriodText = (period) => {
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
  };

  // 진행 바 애니메이션
  const progressPercentage =
    portfolioData.targetAmount > 0
      ? (portfolioData.currentAmount / portfolioData.targetAmount) * 100
      : 0;

  useEffect(() => {
    // 지연 후 진행바 채우기
    const timer = setTimeout(() => {
      setProgressWidth(progressPercentage);
    }, 500);

    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // 커스텀 레전드 데이터 생성
  const getCustomLegendPayload = (data) => {
    return data.map((item) => ({
      value: item.name,
      color: item.color,
    }));
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자산 현황</h1>
          <p className="text-gray-500 mt-1">
            포트폴리오 자산의 전체 현황을 확인할 수 있습니다.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">자산 현황</h1>
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
        <h1 className="text-2xl font-bold text-gray-900">자산 현황</h1>
        <p className="text-gray-500 mt-1">
          포트폴리오 자산의 전체 현황을 확인할 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm relative overflow-hidden">
        {/* 수익률 피드백 알림 */}
        {portfolioData.dailyReturn > 0 && (
          <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-bl-lg flex items-center shadow">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span>
              오늘 수익률이 <strong>{portfolioData.dailyReturn}%</strong>{' '}
              올랐어요!
            </span>
          </div>
        )}

        {portfolioData.dailyReturn < 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-2 rounded-bl-lg flex items-center shadow">
            <TrendingUp className="h-4 w-4 mr-2 transform rotate-180" />
            <span>
              오늘 수익률이{' '}
              <strong>{Math.abs(portfolioData.dailyReturn)}%</strong> 하락했어요
            </span>
          </div>
        )}

        <div className="mb-4 mt-6">
          {/* 목표 금액 섹션 */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm text-gray-500">현재 자산</p>
              <p className="text-xl font-bold">
                <AnimatedNumber
                  value={portfolioData.currentAmount}
                  suffix="원"
                />
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end">
                <h3 className="text-md font-medium text-gray-700">목표 금액</h3>
                <button
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>

              {isEditingGoal ? (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-end mb-3 space-x-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        금액
                      </label>
                      <input
                        type="number"
                        value={editedGoal.amount}
                        onChange={(e) =>
                          setEditedGoal({
                            ...editedGoal,
                            amount: Number(e.target.value),
                          })
                        }
                        className="p-2 border rounded-md w-40 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        기간 값
                      </label>
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
                        className="p-2 border rounded-md w-20 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        기간 단위
                      </label>
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
                        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      >
                        {periodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleGoalSubmit}
                      className="px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 flex items-center"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-end">
                  <p className="text-xl font-bold">
                    <AnimatedNumber
                      value={portfolioData.targetAmount}
                      suffix="원"
                    />
                  </p>
                  <span className="text-sm text-gray-500 ml-2">
                    / {getPeriodText(portfolioData.goalPeriod)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-1500 ease-out"
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
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              <span>{getPeriodText(portfolioData.goalPeriod)} 목표</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">자산 구성</h2>
          <button
            onClick={() => setShowDetailedChart(!showDetailedChart)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {showDetailedChart ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                기간별 요약 보기
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                종목별 상세 보기
              </>
            )}
          </button>
        </div>

        {allAssetsData.length > 0 ? (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {showDetailedChart ? (
                    // 종목별 상세 차트 - 종목명 표시
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={allAssetsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
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
                    // 기간별 요약 차트 - 기간명 표시
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={termSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
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

            {/* 커스텀 레전드 */}
            <CustomizedLegend
              payload={getCustomLegendPayload(
                showDetailedChart ? allAssetsData : termSummaryData
              )}
            />
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">📊</p>
              <p>아직 등록된 자산이 없습니다.</p>
              <p className="text-sm">
                포트폴리오 관리에서 자산을 추가해보세요!
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-800">단기 투자</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  <AnimatedNumber value={termTotals.short} suffix="원" />
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              전체 자산의{' '}
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

          <div className="p-4 bg-purple-50 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-800">중기 투자</p>
                <p className="text-lg font-bold text-purple-600 mt-1">
                  <AnimatedNumber value={termTotals.mid} suffix="원" />
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-purple-500"></div>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              전체 자산의{' '}
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

          <div className="p-4 bg-green-50 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-800">장기 투자</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  <AnimatedNumber value={termTotals.long} suffix="원" />
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-xs text-green-700 mt-2">
              전체 자산의{' '}
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

          <div className="p-4 bg-orange-50 rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-orange-800">보유 현금</p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  <AnimatedNumber value={termTotals.cash} suffix="원" />
                </p>
              </div>
              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
            </div>
            <p className="text-xs text-orange-700 mt-2">
              전체 자산의{' '}
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

        <div className="mt-6 flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2" />
          <p>
            차트에 마우스를 올리면 상세 정보를 확인할 수 있습니다. 상세/요약
            보기를 전환할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
