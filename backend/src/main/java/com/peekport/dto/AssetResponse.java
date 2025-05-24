package com.peekport.dto;

import com.peekport.model.Asset;
import lombok.Getter;

import java.math.BigDecimal;

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

    // 계산된 필드들
    private BigDecimal totalInvestment;  // 총 투자금액
    private BigDecimal totalValue;       // 총 평가금액
    private BigDecimal profitLoss;       // 손익
    private Double returnRate;           // 수익률

    public AssetResponse(Asset asset) {
        this.id = asset.getId();
        this.ticker = asset.getTicker();
        this.name = asset.getName();
        this.category = asset.getCategory();
        this.quantity = asset.getQuantity();
        this.purchasePrice = asset.getPurchasePrice();
        this.currentPrice = asset.getCurrentPrice();
        this.term = asset.getTerm();

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

                // 소수점 2자리까지 문자열 포맷 후 double로 변환
                this.returnRate = Double.parseDouble(String.format("%.2f", rawRate));
            }
        }
    }
}