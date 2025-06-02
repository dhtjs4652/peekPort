package com.peekport.service;

import com.peekport.dto.RebalancingRequest;
import com.peekport.dto.RebalancingResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RebalancingService {

    private static final BigDecimal DEVIATION_THRESHOLD = new BigDecimal("10.0"); // ±10% 이탈 기준
    private static final BigDecimal TRADING_FEE_RATE = new BigDecimal("0.003"); // 거래수수료 0.3%

    public RebalancingResponse analyzeRebalancing(RebalancingRequest request) {
        try {
            log.info("리밸런싱 분석 시작 - Portfolio ID: {}", request.getPortfolioId());

            // 1. 현재 비중과 목표 비중 매핑
            Map<String, BigDecimal> currentRatios = getCurrentRatioMap(request.getCurrentHoldings());
            Map<String, BigDecimal> targetRatios = getTargetRatioMap(request.getTargetAllocations());
            Map<String, RebalancingRequest.CurrentHolding> holdingsMap = getHoldingsMap(request.getCurrentHoldings());

            // 2. 이탈 정도 계산
            List<RebalancingResponse.RebalancingRecommendation> recommendations = new ArrayList<>();
            BigDecimal totalDeviation = BigDecimal.ZERO;
            boolean needsRebalancing = false;

            for (String stockCode : getAllStockCodes(currentRatios, targetRatios)) {
                BigDecimal currentRatio = currentRatios.getOrDefault(stockCode, BigDecimal.ZERO);
                BigDecimal targetRatio = targetRatios.getOrDefault(stockCode, BigDecimal.ZERO);
                BigDecimal deviation = currentRatio.subtract(targetRatio);

                totalDeviation = totalDeviation.add(deviation.abs());

                RebalancingResponse.RebalancingRecommendation recommendation =
                        createRecommendation(stockCode, currentRatio, targetRatio, deviation,
                                holdingsMap.get(stockCode), request.getTotalAssetValue());

                recommendations.add(recommendation);

                // ±10% 이상 이탈 시 리밸런싱 필요
                if (deviation.abs().compareTo(DEVIATION_THRESHOLD) > 0) {
                    needsRebalancing = true;
                }
            }

            // 3. 우선순위 설정 (이탈 정도가 큰 순서)
            recommendations.sort((r1, r2) -> r2.getDeviation().abs().compareTo(r1.getDeviation().abs()));
            for (int i = 0; i < recommendations.size(); i++) {
                recommendations.get(i).setPriority(i + 1);
            }

            // 4. 예상 비용 계산
            BigDecimal estimatedCost = calculateEstimatedCost(recommendations);
            BigDecimal cashRequirement = calculateCashRequirement(recommendations);

            log.info("리밸런싱 분석 완료 - 필요여부: {}, 총 이탈정도: {}%",
                    needsRebalancing, totalDeviation);

            return new RebalancingResponse(
                    needsRebalancing,
                    totalDeviation,
                    recommendations,
                    estimatedCost,
                    cashRequirement
            );

        } catch (Exception e) {
            log.error("리밸런싱 분석 중 오류 발생", e);
            throw new RuntimeException("리밸런싱 분석 실패", e);
        }
    }

    private Map<String, BigDecimal> getCurrentRatioMap(List<RebalancingRequest.CurrentHolding> holdings) {
        return holdings.stream()
                .collect(Collectors.toMap(
                        RebalancingRequest.CurrentHolding::getStockCode,
                        RebalancingRequest.CurrentHolding::getCurrentRatio
                ));
    }

    private Map<String, BigDecimal> getTargetRatioMap(List<RebalancingRequest.TargetAllocation> allocations) {
        return allocations.stream()
                .collect(Collectors.toMap(
                        RebalancingRequest.TargetAllocation::getStockCode,
                        RebalancingRequest.TargetAllocation::getTargetRatio
                ));
    }

    private Map<String, RebalancingRequest.CurrentHolding> getHoldingsMap(List<RebalancingRequest.CurrentHolding> holdings) {
        return holdings.stream()
                .collect(Collectors.toMap(
                        RebalancingRequest.CurrentHolding::getStockCode,
                        holding -> holding
                ));
    }

    private Set<String> getAllStockCodes(Map<String, BigDecimal> currentRatios, Map<String, BigDecimal> targetRatios) {
        Set<String> allCodes = new HashSet<>();
        allCodes.addAll(currentRatios.keySet());
        allCodes.addAll(targetRatios.keySet());
        return allCodes;
    }

    private RebalancingResponse.RebalancingRecommendation createRecommendation(
            String stockCode, BigDecimal currentRatio, BigDecimal targetRatio,
            BigDecimal deviation, RebalancingRequest.CurrentHolding holding,
            BigDecimal totalAssetValue) {

        String action = determineAction(deviation);
        String stockName = holding != null ? holding.getStockName() : stockCode;
        BigDecimal currentPrice = holding != null ? holding.getCurrentPrice() : BigDecimal.ZERO;

        // 목표 금액 계산
        BigDecimal targetValue = totalAssetValue.multiply(targetRatio).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal currentValue = totalAssetValue.multiply(currentRatio).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
        BigDecimal amountDifference = targetValue.subtract(currentValue);

        // 주식 수 계산
        Integer recommendedShares = 0;
        BigDecimal recommendedAmount = BigDecimal.ZERO;

        if (!action.equals("HOLD") && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
            recommendedShares = amountDifference.divide(currentPrice, 0, BigDecimal.ROUND_HALF_UP).intValue();
            recommendedAmount = amountDifference.abs();
        }

        String reason = generateReason(action, deviation);

        return new RebalancingResponse.RebalancingRecommendation(
                stockCode, stockName, currentRatio, targetRatio, deviation,
                action, recommendedShares, recommendedAmount, currentPrice,
                0, reason
        );
    }

    private String determineAction(BigDecimal deviation) {
        if (deviation.abs().compareTo(DEVIATION_THRESHOLD) <= 0) {
            return "HOLD";
        } else if (deviation.compareTo(BigDecimal.ZERO) > 0) {
            return "SELL";
        } else {
            return "BUY";
        }
    }

    private String generateReason(String action, BigDecimal deviation) {
        BigDecimal absDeviation = deviation.abs();

        switch (action) {
            case "BUY":
                return String.format("목표 비중보다 %.1f%% 부족하여 매수 추천", absDeviation);
            case "SELL":
                return String.format("목표 비중보다 %.1f%% 초과하여 매도 추천", absDeviation);
            case "HOLD":
                return String.format("목표 비중과의 차이가 %.1f%%로 적정 수준", absDeviation);
            default:
                return "분석 결과를 확인해주세요";
        }
    }

    private BigDecimal calculateEstimatedCost(List<RebalancingResponse.RebalancingRecommendation> recommendations) {
        return recommendations.stream()
                .filter(r -> !r.getAction().equals("HOLD"))
                .map(r -> r.getRecommendedAmount().multiply(TRADING_FEE_RATE))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateCashRequirement(List<RebalancingResponse.RebalancingRecommendation> recommendations) {
        return recommendations.stream()
                .filter(r -> r.getAction().equals("BUY"))
                .map(RebalancingResponse.RebalancingRecommendation::getRecommendedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}