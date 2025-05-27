package com.peekport.dto;

import com.peekport.model.PortfolioType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
public class GoalAccountResponse {
    private Long id;
    private String name;
    private Long totalAmount;
    private Long targetAmount;
    private BigDecimal cash;
    private PortfolioType portfolioType;
}
