import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Eye,
  PieChart,
} from 'lucide-react';
import api from '../utils/api.js';

const RebalancingAlert = ({ portfolioId, onViewDetails }) => {
  const [alertData, setAlertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchAssetAllocationAnalysis = useCallback(async () => {
    try {
      console.log(`자산 배분 분석 요청 - Portfolio ID: ${portfolioId}`);

      // 실제 자산 배분 분석 API 호출 (추후 구현)
      // const response = await api.get(`/portfolios/${portfolioId}/rebalancing/asset-allocation`);

      // 현재는 목적에 맞는 예시 데이터 사용
      const mockAnalysis = {
        totalAssetValue: 10000000,
        currentStockValue: 8500000,
        currentCashValue: 1500000,
        currentStockRatio: 85.0,
        currentCashRatio: 15.0,
        targetStockRatio: 70.0,
        targetCashRatio: 30.0,
        stockDeviation: 15.0, // 85% - 70% = 15% 초과
        cashDeviation: -15.0, // 15% - 30% = -15% 부족
        stockAdjustment: -1500000, // 주식 1,500,000원 매도 필요
        cashAdjustment: 1500000, // 현금 1,500,000원 증가 필요
        recommendation:
          '주식 비중이 15.0% 초과되었습니다. 1,500,000원 상당의 주식을 매도하여 현금을 늘리는 것을 권장합니다.',
        needsRebalancing: true,
      };

      setAlertData(mockAnalysis);
    } catch (error) {
      console.error('자산 배분 분석 오류:', error);
    }
  }, [portfolioId]);

  const checkRebalancingStatus = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 리밸런싱 상태 체크
      const statusResponse = await api.get(
        `/portfolios/${portfolioId}/rebalancing/status`
      );
      const needsRebalancing = statusResponse.data;

      console.log(`리밸런싱 필요 여부: ${needsRebalancing}`);

      if (needsRebalancing) {
        // 2. 자산 배분 상세 분석 데이터 요청
        await fetchAssetAllocationAnalysis();
        setShowAlert(true);
      } else {
        setShowAlert(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('리밸런싱 상태 확인 오류:', error);
      setLoading(false);
    }
  }, [portfolioId, fetchAssetAllocationAnalysis]);

  useEffect(() => {
    if (portfolioId) {
      checkRebalancingStatus();
    }
  }, [portfolioId, checkRebalancingStatus]);

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const getDeviationColor = (deviation) => {
    if (Math.abs(deviation) >= 15) return 'text-red-600';
    if (Math.abs(deviation) >= 10) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getActionIcon = (adjustment) => {
    if (adjustment > 0) {
      return <TrendingUp className="w-4 h-4 text-blue-500" />;
    } else if (adjustment < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">자산 배분 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  if (!showAlert || !alertData) {
    return null;
  }

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
                자산 배분 리밸런싱 필요
              </h3>
              <p className="text-sm text-gray-600">
                주식과 현금의 비율이 목표에서 벗어났습니다
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

      {/* 자산 배분 현황 */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              ₩{alertData.totalAssetValue?.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">총 자산</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getDeviationColor(
                alertData.stockDeviation
              )}`}
            >
              {alertData.currentStockRatio?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              현재 주식 비중 (목표: {alertData.targetStockRatio}%)
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getDeviationColor(
                alertData.cashDeviation
              )}`}
            >
              {alertData.currentCashRatio?.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              현재 현금 비중 (목표: {alertData.targetCashRatio}%)
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={() => onViewDetails && onViewDetails(alertData)}
              className="flex items-center justify-center space-x-1 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PieChart className="w-4 h-4" />
              <span className="text-sm">상세분석</span>
            </button>
          </div>
        </div>

        {/* 추천사항 요약 */}
        <div className="bg-white rounded-lg p-4 border border-orange-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
            추천사항
          </h4>
          <p className="text-gray-700">{alertData.recommendation}</p>
        </div>

        {/* 상세 정보 (확장 시) */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">
                현재 vs 목표 비율
              </h4>

              {/* 주식 비율 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    주식
                  </span>
                  <span
                    className={`text-sm font-medium ${getDeviationColor(
                      alertData.stockDeviation
                    )}`}
                  >
                    {alertData.currentStockRatio?.toFixed(1)}%
                    {alertData.stockDeviation > 0
                      ? ` (+${alertData.stockDeviation.toFixed(1)}%)`
                      : ` (${alertData.stockDeviation.toFixed(1)}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      alertData.stockDeviation > 10
                        ? 'bg-red-500'
                        : alertData.stockDeviation > 0
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(alertData.currentStockRatio, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">
                    목표: {alertData.targetStockRatio}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* 현금 비율 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    현금
                  </span>
                  <span
                    className={`text-sm font-medium ${getDeviationColor(
                      alertData.cashDeviation
                    )}`}
                  >
                    {alertData.currentCashRatio?.toFixed(1)}%
                    {alertData.cashDeviation > 0
                      ? ` (+${alertData.cashDeviation.toFixed(1)}%)`
                      : ` (${alertData.cashDeviation.toFixed(1)}%)`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Math.abs(alertData.cashDeviation) > 10
                        ? 'bg-red-500'
                        : Math.abs(alertData.cashDeviation) > 0
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(alertData.currentCashRatio, 100)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">
                    목표: {alertData.targetCashRatio}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {/* 조정 필요 금액 */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  조정 필요 금액
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    {getActionIcon(alertData.stockAdjustment)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        주식
                      </div>
                      <div
                        className={`text-sm ${
                          alertData.stockAdjustment > 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {alertData.stockAdjustment > 0 ? '+' : ''}₩
                        {alertData.stockAdjustment?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getActionIcon(alertData.cashAdjustment)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        현금
                      </div>
                      <div
                        className={`text-sm ${
                          alertData.cashAdjustment > 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                        }`}
                      >
                        {alertData.cashAdjustment > 0 ? '+' : ''}₩
                        {alertData.cashAdjustment?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RebalancingAlert;
