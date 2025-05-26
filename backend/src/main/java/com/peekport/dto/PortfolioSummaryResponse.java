package com.peekport.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioSummaryResponse {
    private Long portfolioId;               // 포트폴리오 ID
    private BigDecimal totalInvestment;     // 총 투자금
    private BigDecimal totalValue;          // 총 평가금 (현재가 기준)
    private BigDecimal totalProfitLoss;     // 손익 (평가금 - 투자금)
    private Double totalReturnRate;         // 수익률 (%)
}
