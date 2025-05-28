package com.peekport.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class AssetRequest {
    private String name;
    private String ticker;
    private Integer quantity;
    private BigDecimal purchasePrice;
    private BigDecimal currentPrice;
    private String term;
    private String category;
    private String memo;
    private BigDecimal targetRatio;
}
