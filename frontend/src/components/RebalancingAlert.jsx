import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Eye,
} from 'lucide-react';
import axios from 'axios';

const RebalancingAlert = ({ portfolioId, onViewDetails }) => {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchDetailedAnalysis = useCallback(async () => {
    try {
      // 실제로는 현재 포트폴리오 데이터를 가져와서 분석 요청
      // 여기서는 예시 데이터 사용
      const mockRequest = {
        portfolio_id: portfolioId,
        total_asset_value: 10000000,
        current_holdings: [
          {
            stock_code: '005930',
            stock_name: '삼성전자',
            current_shares: 50,
            current_price: 70000,
            current_value: 3500000,
            current_ratio: 35.0,
          },
          {
            stock_code: '000660',
            stock_name: 'SK하이닉스',
            current_shares: 30,
            current_price: 120000,
            current_value: 3600000,
            current_ratio: 36.0,
          },
        ],
        target_allocations: [
          { stock_code: '005930', target_ratio: 20.0 },
          { stock_code: '000660', target_ratio: 25.0 },
        ],
      };

      const response = await axios.post(
        '/api/portfolio/rebalancing/analyze',
        mockRequest
      );
      setAlertData(response.data);
    } catch (error) {
      console.error('리밸런싱 분석 오류:', error);
    }
  }, [portfolioId]);

  const checkRebalancingStatus = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 간단한 상태 체크
      const statusResponse = await axios.get(
        `/api/portfolio/${portfolioId}/rebalancing/status`
      );
      const needsRebalancing = statusResponse.data;

      if (needsRebalancing) {
        // 2. 상세 분석 데이터 요청
        await fetchDetailedAnalysis();
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('리밸런싱 상태 확인 오류:', error);
      setLoading(false);
    }
  }, [portfolioId, fetchDetailedAnalysis]);

  useEffect(() => {
    if (portfolioId) {
      checkRebalancingStatus();
    }
  }, [portfolioId, checkRebalancingStatus]); // checkRebalancingStatus를 의존성에서 제거

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'SELL':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'BUY':
        return 'text-blue-600 bg-blue-50';
      case 'SELL':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">리밸런싱 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  if (!showAlert || !alertData) {
    return null;
  }

  const highPriorityRecommendations =
    alertData.recommendations?.filter(
      (r) => r.action !== 'HOLD' && r.priority <= 3
    ) || [];

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-md border border-orange-200 mb-6">
      {/* 헤더 */}
      <div className="p-4 border-b border-orange-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                리밸런싱 필요
              </h3>
              <p className="text-sm text-gray-600">
                포트폴리오가 목표 비중에서 이탈했습니다 (총{' '}
                {alertData.total_deviation?.toFixed(1)}% 이탈)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {isExpanded ? '간단히' : '자세히'}
            </button>
            <button
              onClick={dismissAlert}
              className="p-1 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 요약 정보 */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {highPriorityRecommendations.length}
            </div>
            <div className="text-sm text-gray-600">조정 필요 종목</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ₩{alertData.cash_requirement?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">추가 자금 필요</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ₩{alertData.estimated_cost?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">예상 수수료</div>
          </div>
          <div className="text-center">
            <button
              onClick={() => onViewDetails && onViewDetails(alertData)}
              className="flex items-center justify-center space-x-1 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">상세보기</span>
            </button>
          </div>
        </div>

        {/* 상세 추천사항 (확장 시) */}
        {isExpanded && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
              주요 추천사항
            </h4>
            {highPriorityRecommendations.slice(0, 5).map((rec, index) => (
              <div
                key={`recommendation-${index}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  {getActionIcon(rec.action)}
                  <div>
                    <div className="font-medium text-gray-900">
                      {rec.stock_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      현재 {rec.current_ratio?.toFixed(1)}% → 목표{' '}
                      {rec.target_ratio?.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                      rec.action
                    )}`}
                  >
                    {rec.action === 'BUY'
                      ? '매수'
                      : rec.action === 'SELL'
                      ? '매도'
                      : '유지'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {rec.recommended_shares && rec.action !== 'HOLD'
                      ? `${Math.abs(rec.recommended_shares)}주`
                      : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RebalancingAlert;
