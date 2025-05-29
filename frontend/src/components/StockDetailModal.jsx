import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText,
  Save,
  Loader2,
} from 'lucide-react';
import { authAxios } from '../utils/authUtils';

// 애니메이션 숫자 컴포넌트
const AnimatedNumber = ({ value, suffix = '', duration = 1500 }) => {
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

  return (
    <span>
      {typeof value === 'number' && !isNaN(value)
        ? `${Math.floor(count).toLocaleString()}${suffix}`
        : value}
    </span>
  );
};

const StockDetailModal = ({ isOpen, onClose, stock, portfolioId }) => {
  // 백엔드 연동을 위한 상태
  const [stockDetail, setStockDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [memo, setMemo] = useState('');
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  // 데이터 저장 (메모만)
  const handleSave = async () => {
    if (!stock?.id || !portfolioId) return;

    try {
      setIsSaving(true);
      setError(null);

      // 현재 종목 데이터와 업데이트할 데이터 병합
      const updateData = {
        name: stockDetail?.name || stock.name,
        ticker: stockDetail?.ticker || stock.ticker,
        quantity: stockDetail?.quantity || stock.quantity,
        purchasePrice: stockDetail?.purchasePrice || stock.purchasePrice,
        currentPrice: stockDetail?.currentPrice || stock.currentPrice,
        term: stockDetail?.term || stock.term,
        category: stockDetail?.category || stock.category,
        memo: memo,
      };

      await authAxios.put(
        `/api/portfolios/${portfolioId}/stocks/${stock.id}`,
        updateData
      );

      alert('저장되었습니다.');
      setIsEditingMemo(false);
    } catch (err) {
      console.error('저장 실패:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 모달이 열릴 때마다 데이터 로드
  const fetchStockDetail = useCallback(async () => {
    if (!stock?.id || !portfolioId || !isOpen) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await authAxios.get(
        `/api/portfolios/${portfolioId}/stocks/${stock.id}`
      );

      const data = response.data;
      setStockDetail(data);
      setMemo(data.memo || '');
    } catch (err) {
      console.error('종목 상세 정보 로드 실패:', err);
      setError('종목 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [stock?.id, portfolioId, isOpen]);

  useEffect(() => {
    if (isOpen && stock?.id && portfolioId) {
      fetchStockDetail();
    }
  }, [isOpen, stock?.id, portfolioId, fetchStockDetail]);

  useEffect(() => {
    if (!isOpen) {
      setStockDetail(null);
      setMemo('');
      setError(null);
      setIsEditingMemo(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 실제 데이터 또는 props 데이터 사용
  const displayStock = stockDetail || stock;

  const calculateProfit = () => {
    if (!displayStock) return { profit: 0, profitRate: 0 };

    const profit =
      (displayStock.currentPrice - displayStock.purchasePrice) *
      displayStock.quantity;
    const profitRate =
      ((displayStock.currentPrice - displayStock.purchasePrice) /
        displayStock.purchasePrice) *
      100;
    return { profit, profitRate };
  };

  const { profit, profitRate } = calculateProfit();
  const isProfitable = profit >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto shadow-xl animate-slide-up">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {displayStock?.name || '종목 정보'} 상세 정보
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-gray-600">데이터를 불러오는 중...</span>
              </div>
            </div>
          ) : error ? (
            // 에러 상태
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          ) : displayStock ? (
            <>
              {/* 종목 요약 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-2">총 투자 금액</h3>
                  <p className="text-xl font-bold">
                    <AnimatedNumber
                      value={displayStock.quantity * displayStock.purchasePrice}
                      suffix="원"
                    />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {displayStock.quantity}주 ×{' '}
                    <AnimatedNumber
                      value={displayStock.purchasePrice}
                      suffix="원"
                    />
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 mb-2">총 손익</h3>
                  <p
                    className={`text-xl font-bold flex items-center ${
                      isProfitable ? 'text-red-500' : 'text-blue-500'
                    }`}
                  >
                    {isProfitable ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <AnimatedNumber value={profit} suffix="원" />
                  </p>
                  <p
                    className={`text-xs ${
                      isProfitable ? 'text-red-500' : 'text-blue-500'
                    } mt-1`}
                  >
                    <AnimatedNumber
                      value={profitRate}
                      suffix="%"
                      duration={800}
                    />
                  </p>
                </div>
              </div>

              {/* 추가 정보 섹션 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    투자 노트
                  </h3>
                  {isEditingMemo ? (
                    <div className="space-y-3">
                      <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="투자 노트를 입력하세요..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        rows={4}
                        disabled={isSaving}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setIsEditingMemo(false)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          disabled={isSaving}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-3">
                        {memo || '투자 노트가 없습니다.'}
                      </p>
                      <button
                        onClick={() => setIsEditingMemo(true)}
                        className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
                        disabled={isSaving}
                      >
                        {memo ? '노트 수정하기' : '+ 노트 추가하기'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-3">주요 지표</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span className="text-gray-500">평균 매수가</span>
                      <span>
                        {displayStock.purchasePrice?.toLocaleString()}원
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">현재가</span>
                      <span>
                        {displayStock.currentPrice?.toLocaleString()}원
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">보유 수량</span>
                      <span>{displayStock.quantity}주</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">투자 기간</span>
                      <span>
                        {displayStock.term === 'short'
                          ? '단기'
                          : displayStock.term === 'mid'
                          ? '중기'
                          : '장기'}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-500">수익률</span>
                      <span
                        className={`${
                          isProfitable ? 'text-red-500' : 'text-blue-500'
                        }`}
                      >
                        {profitRate.toFixed(2)}%
                      </span>
                    </li>
                    {displayStock.category && (
                      <li className="flex justify-between">
                        <span className="text-gray-500">카테고리</span>
                        <span>{displayStock.category}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 저장 및 닫기 버튼 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  닫기
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>종목 정보를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;
