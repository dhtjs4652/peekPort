import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const GoalBasedAnalysis = ({ portfolio, goals }) => {
  const [selectedGoal, setSelectedGoal] = useState(goals[0].id);
  const [simulationPeriod] = useState(60); // 60개월
  const [monthlyContribution, setMonthlyContribution] = useState(500000); // 50만원
  const [riskLevel, setRiskLevel] = useState('moderate'); // 중간 위험

  // 목표 달성 시뮬레이션 데이터 계산
  const calculateProjection = () => {
    const currentGoal = goals.find((g) => g.id === selectedGoal);
    const currentTotal = portfolio.totalValue;
    const targetAmount = currentGoal.amount;
    const monthsToGoal = currentGoal.months;

    // 리스크 레벨에 따른 연간 기대수익률 설정
    const annualReturns = {
      conservative: 0.04, // 4%
      moderate: 0.07, // 7%
      aggressive: 0.1, // 10%
    };

    const monthlyReturn = Math.pow(1 + annualReturns[riskLevel], 1 / 12) - 1;

    // 월별 자산 성장 시뮬레이션
    const projectionData = [];
    let currentAmount = currentTotal;

    for (let month = 0; month <= simulationPeriod; month++) {
      const growth = currentAmount * monthlyReturn;
      currentAmount += growth + monthlyContribution;

      projectionData.push({
        month,
        value: currentAmount,
        goal: month >= monthsToGoal ? targetAmount : null,
      });
    }

    return projectionData;
  };

  // 최적 자산 배분 계산
  const calculateOptimalAllocation = () => {
    const currentGoal = goals.find((g) => g.id === selectedGoal);
    const timeToGoal = currentGoal.months;

    // 목표 기간에 따른 자산 배분 조정
    // (실제로는 더 복잡한 알고리즘 사용)
    let stockAllocation, bondAllocation, cashAllocation;

    if (timeToGoal <= 12) {
      // 단기 (1년 이하)
      stockAllocation = 0.2;
      bondAllocation = 0.3;
      cashAllocation = 0.5;
    } else if (timeToGoal <= 60) {
      // 중기 (1-5년)
      stockAllocation = 0.5;
      bondAllocation = 0.4;
      cashAllocation = 0.1;
    } else {
      // 장기 (5년 이상)
      stockAllocation = 0.7;
      bondAllocation = 0.25;
      cashAllocation = 0.05;
    }

    return [
      { name: '주식', value: stockAllocation },
      { name: '채권', value: bondAllocation },
      { name: '현금성', value: cashAllocation },
    ];
  };

  const projectionData = calculateProjection();
  const optimalAllocation = calculateOptimalAllocation();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  // 목표 달성 가능성 계산
  const calculateProbability = () => {
    const currentGoal = goals.find((g) => g.id === selectedGoal);
    const timeToGoal = currentGoal.months;
    const projectedFinalValue = projectionData[timeToGoal]?.value || 0;

    // 간단한 확률 계산 (실제로는 더 복잡한 통계적 방법 사용)
    const probability =
      projectedFinalValue >= currentGoal.amount
        ? Math.min(0.99, (projectedFinalValue / currentGoal.amount) * 0.8)
        : Math.max(0.01, (currentGoal.amount / projectedFinalValue) * 0.2);

    return Math.round(probability * 100);
  };

  const goalProbability = calculateProbability();

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">목표 기반 포트폴리오 분석</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-md font-semibold mb-2">목표 선택</h3>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.name} - {goal.amount.toLocaleString()}원
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-md font-semibold mb-2">월 추가 투자금액</h3>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-md font-semibold mb-2">위험 수준</h3>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="conservative">보수적 (낮은 위험)</option>
            <option value="moderate">중간 (적정 위험)</option>
            <option value="aggressive">공격적 (높은 위험)</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">목표 달성 시뮬레이션</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                label={{
                  value: '경과 개월',
                  position: 'insideBottom',
                  offset: -5,
                }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                label={{
                  value: '포트폴리오 가치 (원)',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name="예상 포트폴리오 가치"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="goal"
                name="목표 금액"
                stroke="#ff7300"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">최적 자산 배분</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={optimalAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {optimalAllocation.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${(value * 100).toFixed(0)}%`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">목표 달성 확률</h3>
          <div className="bg-gray-100 p-6 rounded-lg h-full flex flex-col justify-center items-center">
            <div className="text-5xl font-bold mb-4 text-blue-600">
              {goalProbability}%
            </div>
            <p className="text-gray-600 text-center">
              현재 설정으로 목표 달성 가능성입니다.
              {goalProbability > 80
                ? ' 목표 달성이 매우 유망합니다.'
                : goalProbability > 50
                ? ' 목표 달성이 가능해 보입니다.'
                : ' 목표 달성을 위해 투자 전략 조정이 필요합니다.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">추천 조치사항</h3>
        <ul className="space-y-2 text-gray-700">
          <li>
            • 월 투자금액을 {monthlyContribution < 1000000 ? '증가' : '유지'}
            하여 목표 달성 가능성을 높이세요.
          </li>
          <li>
            • 포트폴리오 구성을 추천 자산 배분과 일치시켜 위험 대비 수익을
            최적화하세요.
          </li>
          <li>• 정기적인 리밸런싱을 통해 포트폴리오를 관리하세요.</li>
        </ul>
      </div>
    </div>
  );
};

export default GoalBasedAnalysis;
