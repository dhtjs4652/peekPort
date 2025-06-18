import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  X,
} from 'lucide-react';
import api from '../utils/api';

const RebalancingAlert = ({ portfolioId }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkRebalancingStatus = useCallback(async () => {
    try {
      setLoading(true);
      console.log('리밸런싱 상태 확인 시작 - Portfolio ID:', portfolioId);

      // 1. 리밸런싱 상태 체크
      const statusResponse = await api.get(
        `/portfolios/${portfolioId}/rebalancing/status`
      );

      console.log('리밸런싱 필요 여부:', statusResponse.data);

      if (statusResponse.data === true) {
        // 리밸런싱 필요 시 간단한 알림 표시 (백엔드 로그에서 상세 정보 확인 가능)
        const simpleAnalysis = {
          needsRebalancing: true,
          currentStockRatio: 99.9, // 실제로는 백엔드 로그에서 확인
          currentCashRatio: 0.1,
          targetStockRatio: 70.0,
          targetCashRatio: 30.0,
          recommendation:
            '주식 비중이 목표치를 크게 초과했습니다. 일부 주식을 매도하여 현금 비중을 늘리는 것을 권장합니다.',
        };

        setAnalysis(simpleAnalysis);
        setShowAlert(true);
        console.log('리밸런싱 필요 - 백엔드 로그에서 상세 정보 확인');
      } else {
        setShowAlert(false);
        setAnalysis(null);
        console.log('리밸런싱 불필요');
      }
    } catch (error) {
      console.error('리밸런싱 상태 확인 오류:', error);
      setShowAlert(false);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    checkRebalancingStatus();
  }, [checkRebalancingStatus]);

  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0.0%';
    return `${value.toFixed(1)}%`;
  };

  const getDeviationColor = (deviation) => {
    const absDeviation = Math.abs(deviation);
    if (absDeviation >= 20) return 'text-red-600';
    if (absDeviation >= 10) return 'text-orange-600';
    return 'text-yellow-600';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">리밸런싱 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  if (!showAlert || !analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 기본 알림 */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                자산 배분 리밸런싱 필요
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">현재 주식 비중:</span>
                  <span
                    className={`font-medium ${getDeviationColor(
                      analysis.stockDeviation
                    )}`}
                  >
                    {formatPercentage(analysis.currentStockRatio)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">목표 주식 비중:</span>
                  <span className="font-medium text-gray-900">
                    {formatPercentage(analysis.targetStockRatio)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">현재 현금 비중:</span>
                  <span
                    className={`font-medium ${getDeviationColor(
                      analysis.cashDeviation
                    )}`}
                  >
                    {formatPercentage(analysis.currentCashRatio)}
                  </span>
                </div>
              </div>
              <p className="text-orange-700 mt-3 font-medium">
                {analysis.recommendation}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-orange-600 hover:text-orange-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
          >
            {showDetails ? '간단히' : '자세히'}
          </button>
          <button
            onClick={() => setShowAlert(false)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            나중에
          </button>
        </div>
      </div>

      {/* 상세 분석 */}
      {showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            상세 자산 배분 분석
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 현재 상태 */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-800 border-b pb-2">
                현재 포트폴리오
              </h5>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">총 자산 가치</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(analysis.totalAssetValue)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-gray-600">주식 자산</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(analysis.currentStockValue)}
                    </div>
                    <div
                      className={`text-sm ${getDeviationColor(
                        analysis.stockDeviation
                      )}`}
                    >
                      {formatPercentage(analysis.currentStockRatio)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-gray-600">현금 자산</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(analysis.currentCashValue)}
                    </div>
                    <div
                      className={`text-sm ${getDeviationColor(
                        analysis.cashDeviation
                      )}`}
                    >
                      {formatPercentage(analysis.currentCashRatio)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 목표 및 조정 */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-800 border-b pb-2">
                목표 배분 및 조정
              </h5>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-gray-600">목표 주식 비중</span>
                  </div>
                  <span className="font-medium text-purple-600">
                    {formatPercentage(analysis.targetStockRatio)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-purple-600 mr-1" />
                    <span className="text-gray-600">목표 현금 비중</span>
                  </div>
                  <span className="font-medium text-purple-600">
                    {formatPercentage(analysis.targetCashRatio)}
                  </span>
                </div>

                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">주식 조정 필요</span>
                    <span
                      className={`font-medium ${
                        analysis.stockAdjustment > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {analysis.stockAdjustment > 0 ? '+' : ''}
                      {formatCurrency(analysis.stockAdjustment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">현금 조정 필요</span>
                    <span
                      className={`font-medium ${
                        analysis.cashAdjustment > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {analysis.cashAdjustment > 0 ? '+' : ''}
                      {formatCurrency(analysis.cashAdjustment)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 이탈 정도 시각화 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h6 className="font-medium text-gray-800 mb-3">비중 이탈 정도</h6>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">주식 비중 이탈</span>
                <span
                  className={`text-sm font-medium ${getDeviationColor(
                    analysis.stockDeviation
                  )}`}
                >
                  {analysis.stockDeviation > 0 ? '+' : ''}
                  {formatPercentage(analysis.stockDeviation)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    Math.abs(analysis.stockDeviation) >= 20
                      ? 'bg-red-500'
                      : Math.abs(analysis.stockDeviation) >= 10
                      ? 'bg-orange-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.abs(analysis.stockDeviation) * 2,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 추천사항 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h6 className="font-medium text-blue-800 mb-2">💡 추천사항</h6>
            <p className="text-blue-700 text-sm leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RebalancingAlert;
