import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Calculator,
  AlertCircle,
} from 'lucide-react';

const RebalancingDetailModal = ({ isOpen, onClose, rebalancingData }) => {
  const [activeTab, setActiveTab] = useState('recommendations');

  if (!isOpen || !rebalancingData) return null;

  const buyRecommendations =
    rebalancingData.recommendations?.filter((r) => r.action === 'BUY') || [];
  const sellRecommendations =
    rebalancingData.recommendations?.filter((r) => r.action === 'SELL') || [];
  const holdRecommendations =
    rebalancingData.recommendations?.filter((r) => r.action === 'HOLD') || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              리밸런싱 상세 분석
            </h2>
            <p className="text-gray-600 mt-1">
              포트폴리오 최적화를 위한 매매 추천사항입니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* 요약 정보 */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {rebalancingData.total_deviation?.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">총 이탈정도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                ₩{rebalancingData.cash_requirement?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">추가 자금 필요</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                ₩{rebalancingData.estimated_cost?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">예상 거래비용</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {rebalancingData.recommendations?.length || 0}
              </div>
              <div className="text-sm text-gray-600">전체 종목수</div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            추천사항
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analysis'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            분석 결과
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* 매수 추천 */}
              {buyRecommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                    매수 추천 ({buyRecommendations.length}건)
                  </h3>
                  <div className="space-y-3">
                    {buyRecommendations.map((rec, index) => (
                      <div
                        key={`buy-${index}`}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rec.stock_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              현재 {rec.current_ratio?.toFixed(1)}% → 목표{' '}
                              {rec.target_ratio?.toFixed(1)}% (부족:{' '}
                              {Math.abs(rec.deviation)?.toFixed(1)}%)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {rec.recommended_shares}주
                            </div>
                            <div className="text-sm text-gray-600">
                              ₩{rec.recommended_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {rec.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 매도 추천 */}
              {sellRecommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                    매도 추천 ({sellRecommendations.length}건)
                  </h3>
                  <div className="space-y-3">
                    {sellRecommendations.map((rec, index) => (
                      <div
                        key={`sell-${index}`}
                        className="bg-red-50 border border-red-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {rec.stock_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              현재 {rec.current_ratio?.toFixed(1)}% → 목표{' '}
                              {rec.target_ratio?.toFixed(1)}% (초과:{' '}
                              {Math.abs(rec.deviation)?.toFixed(1)}%)
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              {Math.abs(rec.recommended_shares)}주
                            </div>
                            <div className="text-sm text-gray-600">
                              ₩{rec.recommended_amount?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          {rec.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 유지 추천 */}
              {holdRecommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Minus className="w-5 h-5 text-gray-500 mr-2" />
                    유지 추천 ({holdRecommendations.length}건)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {holdRecommendations.map((rec, index) => (
                      <div
                        key={`hold-${index}`}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="font-medium text-gray-900">
                          {rec.stock_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          현재 {rec.current_ratio?.toFixed(1)}% (적정 수준)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* 분석 요약 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="font-semibold text-gray-900">분석 요약</h3>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>
                    • 포트폴리오가 목표 비중에서 총{' '}
                    {rebalancingData.total_deviation?.toFixed(1)}% 이탈
                  </p>
                  <p>• 리밸런싱을 통해 위험 분산과 수익 최적화 가능</p>
                  <p>
                    • 예상 거래비용: ₩
                    {rebalancingData.estimated_cost?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 거래 계산 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Calculator className="w-5 h-5 text-blue-500 mr-2" />
                  거래 비용 분석
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">총 매수 금액</div>
                      <div className="text-lg font-semibold text-blue-600">
                        ₩
                        {buyRecommendations
                          .reduce(
                            (sum, rec) => sum + (rec.recommended_amount || 0),
                            0
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">총 매도 금액</div>
                      <div className="text-lg font-semibold text-red-600">
                        ₩
                        {sellRecommendations
                          .reduce(
                            (sum, rec) => sum + (rec.recommended_amount || 0),
                            0
                          )
                          .toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        거래 수수료 (0.3%)
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        ₩{rebalancingData.estimated_cost?.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        추가 필요 자금
                      </div>
                      <div className="text-lg font-semibold text-orange-600">
                        ₩{rebalancingData.cash_requirement?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            type="button"
          >
            닫기
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            type="button"
          >
            리밸런싱 실행
          </button>
        </div>
      </div>
    </div>
  );
};

export default RebalancingDetailModal;
