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
public class RebalancingRequest {

    @JsonProperty("portfolio_id")
    private Long portfolioId;

    @JsonProperty("total_asset_value")
    private BigDecimal totalAssetValue;

    @JsonProperty("current_holdings")
    private List<CurrentHolding> currentHoldings;

    @JsonProperty("target_allocations")
    private List<TargetAllocation> targetAllocations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrentHolding {
        @JsonProperty("stock_code")
        private String stockCode;

        @JsonProperty("stock_name")
        private String stockName;

        @JsonProperty("current_shares")
        private Integer currentShares;

        @JsonProperty("current_price")
        private BigDecimal currentPrice;

        @JsonProperty("current_value")
        private BigDecimal currentValue;

        @JsonProperty("current_ratio")
        private BigDecimal currentRatio;  // 현재 비중 (%)
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TargetAllocation {
        @JsonProperty("stock_code")
        private String stockCode;

        @JsonProperty("target_ratio")
        private BigDecimal targetRatio;  // 목표 비중 (%)
    }
}