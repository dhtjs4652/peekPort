import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, DollarSign, ArrowUp, ArrowDown, FileText } from 'lucide-react';

// 애니메이션 숫자 컴포넌트
const AnimatedNumber = ({ value, suffix = "", duration = 1500 }) => {
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
      const currentValue = previousValue.current + (value - previousValue.current) * easedProgress;
      
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
        : value
      }
    </span>
  );
};

const StockDetailModal = ({ isOpen, onClose, stock, transactions }) => {
  if (!isOpen) return null;
  
  const calculateProfit = () => {
    const profit = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
    const profitRate = ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100;
    return { profit, profitRate };
  };
  
  const { profit, profitRate } = calculateProfit();
  const isProfitable = profit >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto shadow-xl animate-slide-up">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{stock.name} 상세 정보</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* 종목 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">총 투자 금액</h3>
              <p className="text-xl font-bold">
                <AnimatedNumber value={stock.quantity * stock.purchasePrice} suffix="원" />
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stock.quantity}주 × <AnimatedNumber value={stock.purchasePrice} suffix="원" />
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm text-gray-500 mb-2">총 손익</h3>
              <p className={`text-xl font-bold flex items-center ${isProfitable ? 'text-red-500' : 'text-blue-500'}`}>
                {isProfitable ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                <AnimatedNumber value={profit} suffix="원" />
              </p>
              <p className={`text-xs ${isProfitable ? 'text-red-500' : 'text-blue-500'} mt-1`}>
                <AnimatedNumber value={profitRate} suffix="%" duration={800} />
              </p>
            </div>
          </div>
          
          {/* 거래 내역 테이블 */}
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-4">거래 내역</h3>
            {transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === '매수' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.quantity}주</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.price.toLocaleString()}원</td>
                        <td className="px-6 py-4 whitespace-nowrap">{(transaction.quantity * transaction.price).toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                거래 내역이 없습니다.
              </div>
            )}
          </div>
          
          {/* 추가 정보 섹션 */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">투자 노트</h3>
              <p className="text-gray-600">{stock.notes || '투자 노트가 없습니다.'}</p>
              {!stock.notes && (
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-700 transition-colors">
                  + 노트 추가하기
                </button>
              )}
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">주요 지표</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-500">평균 매수가</span>
                  <span>{stock.purchasePrice?.toLocaleString()}원</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">현재가</span>
                  <span>{stock.currentPrice?.toLocaleString()}원</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">보유 수량</span>
                  <span>{stock.quantity}주</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-500">수익률</span>
                  <span className={`${isProfitable ? 'text-red-500' : 'text-blue-500'}`}>
                    {profitRate.toFixed(2)}%
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 추가 버튼들 */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
              onClick={onClose}
            >
              닫기
            </button>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
            >
              거래 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;