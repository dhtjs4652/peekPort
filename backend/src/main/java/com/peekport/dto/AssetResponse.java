package com.peekport.dto;

import com.peekport.model.Asset;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class AssetResponse {
    private Long id;
    private String ticker;
    private String name;
    private String category;
    private Integer quantity;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private String term;

    private BigDecimal totalInvestment;
    private BigDecimal totalValue;
    private BigDecimal profitLoss;
    private Double returnRate;

    // ✅ 추가된 필드
    private BigDecimal avgPrice;
    private String memo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AssetResponse(Asset asset) {
        this.id = asset.getId();
        this.ticker = asset.getTicker();
        this.name = asset.getName();
        this.category = asset.getCategory();
        this.quantity = asset.getQuantity();
        this.purchasePrice = asset.getPurchasePrice();
        this.currentPrice = asset.getCurrentPrice();
        this.term = asset.getTerm();

        // ✅ 추가 필드 매핑
        this.avgPrice = asset.getPurchasePrice(); // 현재는 매입가 그대로
        this.memo = asset.getMemo();
        this.createdAt = asset.getCreatedAt();
        this.updatedAt = asset.getUpdatedAt();

        // 계산된 값들
        if (quantity != null && purchasePrice != null) {
            this.totalInvestment = purchasePrice.multiply(BigDecimal.valueOf(quantity));
        }

        if (quantity != null && currentPrice != null) {
            this.totalValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
        }

        if (totalInvestment != null && totalValue != null) {
            this.profitLoss = totalValue.subtract(totalInvestment);

            if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal rawRate = profitLoss
                        .divide(totalInvestment, 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100));

                this.returnRate = Double.parseDouble(String.format("%.2f", rawRate));
            }
        }
    }
}
