package com.peekport.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class GoalAccountRequest {
    private String name;
    private Long totalAmount;
    private Long targetAmount;
    private BigDecimal cash;

}
