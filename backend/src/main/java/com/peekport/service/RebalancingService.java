package com.peekport.service;

import com.peekport.dto.RebalancingRequest;
import com.peekport.dto.RebalancingResponse;
import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.repository.AssetRepository;
import com.peekport.repository.GoalAccountRepository;
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

    private final AssetRepository assetRepository;
    private final GoalAccountRepository goalAccountRepository;

    private static final BigDecimal DEVIATION_THRESHOLD = new BigDecimal("10.0"); // ±10% 이탈 기준
    private static final BigDecimal TRADING_FEE_RATE = new BigDecimal("0.003"); // 거래수수료 0.3%

    // 기본 목표 자산 배분 (주식 70%, 현금 30%)
    private static final Double DEFAULT_STOCK_RATIO = 70.0;
    private static final Double DEFAULT_CASH_RATIO = 30.0;

    /**
     * 자산 배분 리밸런싱 필요 여부 체크
     * 주식 vs 현금 비율을 기준으로 ±10% 이탈 시 true 반환
     */
    public Boolean checkAssetAllocationRebalancing(Long portfolioId) {
        try {
            log.info("자산 배분 리밸런싱 체크 시작 - Portfolio ID: {}", portfolioId);

            // 1. 포트폴리오 조회
            Optional<GoalAccount> portfolioOpt = goalAccountRepository.findById(portfolioId);
            if (portfolioOpt.isEmpty()) {
                log.warn("포트폴리오를 찾을 수 없음 - ID: {}", portfolioId);
                return false;
            }

            GoalAccount portfolio = portfolioOpt.get();

            // 2. 해당 포트폴리오의 모든 자산 조회
            List<Asset> assets = assetRepository.findByGoalAccountId(portfolioId);

            if (assets.isEmpty()) {
                log.info("포트폴리오에 자산이 없음 - ID: {}", portfolioId);
                return false;
            }

            // 3. 주식 총 가치 계산
            BigDecimal totalStockValue = BigDecimal.ZERO;
            for (Asset asset : assets) {
                if (asset.getQuantity() != null && asset.getCurrentPrice() != null) {
                    BigDecimal assetValue = asset.getCurrentPrice()
                            .multiply(new BigDecimal(asset.getQuantity()));
                    totalStockValue = totalStockValue.add(assetValue);
                }
            }

            // 4. 현금 잔고 조회 (GoalAccount의 cash)
            BigDecimal cashBalance = portfolio.getCash() != null
                    ? portfolio.getCash()
                    : BigDecimal.ZERO;

            // 5. 총 자산 가치 계산
            BigDecimal totalAssetValue = totalStockValue.add(cashBalance);

            if (totalAssetValue.compareTo(BigDecimal.ZERO) == 0) {
                log.info("총 자산 가치가 0 - Portfolio ID: {}", portfolioId);
                return false;
            }

            // 6. 현재 주식/현금 비율 계산
            BigDecimal currentStockRatio = totalStockValue
                    .multiply(new BigDecimal("100"))
                    .divide(totalAssetValue, 2, BigDecimal.ROUND_HALF_UP);

            BigDecimal currentCashRatio = cashBalance
                    .multiply(new BigDecimal("100"))
                    .divide(totalAssetValue, 2, BigDecimal.ROUND_HALF_UP);

            // 7. 목표 비율 (현재는 하드코딩, 추후 DB에서 조회)
            BigDecimal targetStockRatio = new BigDecimal(DEFAULT_STOCK_RATIO);
            BigDecimal targetCashRatio = new BigDecimal(DEFAULT_CASH_RATIO);

            // 8. 이탈 정도 계산
            BigDecimal stockDeviation = currentStockRatio.subtract(targetStockRatio).abs();
            BigDecimal cashDeviation = currentCashRatio.subtract(targetCashRatio).abs();

            // 9. ±10% 이상 이탈 시 리밸런싱 필요
            boolean needsRebalancing = stockDeviation.compareTo(DEVIATION_THRESHOLD) > 0
                    || cashDeviation.compareTo(DEVIATION_THRESHOLD) > 0;

            log.info("자산 배분 분석 결과 - Portfolio ID: {}", portfolioId);
            log.info("총 자산: {}, 주식: {}, 현금: {}", totalAssetValue, totalStockValue, cashBalance);
            log.info("현재 비율 - 주식: {}%, 현금: {}%", currentStockRatio, currentCashRatio);
            log.info("목표 비율 - 주식: {}%, 현금: {}%", targetStockRatio, targetCashRatio);
            log.info("이탈 정도 - 주식: {}%, 현금: {}%", stockDeviation, cashDeviation);
            log.info("리밸런싱 필요: {}", needsRebalancing);

            return needsRebalancing;

        } catch (Exception e) {
            log.error("자산 배분 리밸런싱 체크 중 오류 발생 - Portfolio ID: {}", portfolioId, e);
            return false;
        }
    }

    /**
     * 자산 배분 상세 분석
     * 주식/현금 비율 기반 리밸런싱 추천사항 제공
     */
    public Map<String, Object> analyzeAssetAllocation(Long portfolioId) {
        try {
            // 포트폴리오 조회
            Optional<GoalAccount> portfolioOpt = goalAccountRepository.findById(portfolioId);
            if (portfolioOpt.isEmpty()) {
                throw new RuntimeException("포트폴리오를 찾을 수 없습니다: " + portfolioId);
            }

            GoalAccount portfolio = portfolioOpt.get();
            List<Asset> assets = assetRepository.findByGoalAccountId(portfolioId);

            // 주식 총 가치 계산
            BigDecimal totalStockValue = assets.stream()
                    .filter(asset -> asset.getQuantity() != null && asset.getCurrentPrice() != null)
                    .map(asset -> asset.getCurrentPrice().multiply(new BigDecimal(asset.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal cashBalance = portfolio.getCash() != null
                    ? portfolio.getCash() : BigDecimal.ZERO;
            BigDecimal totalAssetValue = totalStockValue.add(cashBalance);

            // 현재 비율
            BigDecimal currentStockRatio = totalStockValue
                    .multiply(new BigDecimal("100"))
                    .divide(totalAssetValue, 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal currentCashRatio = cashBalance
                    .multiply(new BigDecimal("100"))
                    .divide(totalAssetValue, 2, BigDecimal.ROUND_HALF_UP);

            // 목표 비율
            BigDecimal targetStockRatio = new BigDecimal(DEFAULT_STOCK_RATIO);
            BigDecimal targetCashRatio = new BigDecimal(DEFAULT_CASH_RATIO);

            // 이탈 정도
            BigDecimal stockDeviation = currentStockRatio.subtract(targetStockRatio);
            BigDecimal cashDeviation = currentCashRatio.subtract(targetCashRatio);

            // 조정 필요 금액 계산
            BigDecimal targetStockValue = totalAssetValue
                    .multiply(targetStockRatio)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal targetCashValue = totalAssetValue
                    .multiply(targetCashRatio)
                    .divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);

            BigDecimal stockAdjustment = targetStockValue.subtract(totalStockValue);
            BigDecimal cashAdjustment = targetCashValue.subtract(cashBalance);

            // 추천사항 생성
            String recommendation = generateAssetAllocationRecommendation(
                    stockDeviation, cashDeviation, stockAdjustment);

            Map<String, Object> result = new HashMap<>();
            result.put("totalAssetValue", totalAssetValue);
            result.put("currentStockValue", totalStockValue);
            result.put("currentCashValue", cashBalance);
            result.put("currentStockRatio", currentStockRatio);
            result.put("currentCashRatio", currentCashRatio);
            result.put("targetStockRatio", targetStockRatio);
            result.put("targetCashRatio", targetCashRatio);
            result.put("stockDeviation", stockDeviation);
            result.put("cashDeviation", cashDeviation);
            result.put("stockAdjustment", stockAdjustment);
            result.put("cashAdjustment", cashAdjustment);
            result.put("recommendation", recommendation);
            result.put("needsRebalancing", stockDeviation.abs().compareTo(DEVIATION_THRESHOLD) > 0);

            return result;

        } catch (Exception e) {
            log.error("자산 배분 분석 중 오류 발생 - Portfolio ID: {}", portfolioId, e);
            throw new RuntimeException("자산 배분 분석 실패", e);
        }
    }

    private String generateAssetAllocationRecommendation(
            BigDecimal stockDeviation, BigDecimal cashDeviation, BigDecimal stockAdjustment) {

        if (stockDeviation.abs().compareTo(DEVIATION_THRESHOLD) <= 0) {
            return "현재 자산 배분이 적정 수준입니다.";
        }

        if (stockDeviation.compareTo(BigDecimal.ZERO) > 0) {
            // 주식 비중이 과도함
            return String.format("주식 비중이 %.1f%% 초과되었습니다. %.0f원 상당의 주식을 매도하여 현금을 늘리는 것을 권장합니다.",
                    stockDeviation, stockAdjustment.abs());
        } else {
            // 주식 비중이 부족함
            return String.format("주식 비중이 %.1f%% 부족합니다. %.0f원 상당의 주식을 추가 매수하는 것을 권장합니다.",
                    stockDeviation.abs(), stockAdjustment.abs());
        }
    }

    // 기존 메서드들은 그대로 유지
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