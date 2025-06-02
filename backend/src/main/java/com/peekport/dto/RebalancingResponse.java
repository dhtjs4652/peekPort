package com.peekport.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RebalancingResponse {

    @JsonProperty("is_rebalancing_needed")
    private Boolean isRebalancingNeeded;

    @JsonProperty("total_deviation")
    private BigDecimal totalDeviation;  // 전체 이탈 정도

    @JsonProperty("recommendations")
    private List<RebalancingRecommendation> recommendations;

    @JsonProperty("estimated_cost")
    private BigDecimal estimatedCost;  // 예상 거래비용

    @JsonProperty("cash_requirement")
    private BigDecimal cashRequirement;  // 필요한 현금

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RebalancingRecommendation {
        @JsonProperty("stock_code")
        private String stockCode;

        @JsonProperty("stock_name")
        private String stockName;

        @JsonProperty("current_ratio")
        private BigDecimal currentRatio;

        @JsonProperty("target_ratio")
        private BigDecimal targetRatio;

        @JsonProperty("deviation")
        private BigDecimal deviation;  // 이탈 정도 (%)

        @JsonProperty("action")
        private String action;  // "BUY", "SELL", "HOLD"

        @JsonProperty("recommended_shares")
        private Integer recommendedShares;  // 매수/매도 주식 수

        @JsonProperty("recommended_amount")
        private BigDecimal recommendedAmount;  // 매수/매도 금액

        @JsonProperty("current_price")
        private BigDecimal currentPrice;

        @JsonProperty("priority")
        private Integer priority;  // 우선순위 (1이 가장 높음)

        @JsonProperty("reason")
        private String reason;  // 추천 이유
    }
}