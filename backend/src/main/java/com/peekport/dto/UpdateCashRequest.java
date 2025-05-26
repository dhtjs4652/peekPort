package com.peekport.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class UpdateCashRequest {
    private BigDecimal cash;
}
