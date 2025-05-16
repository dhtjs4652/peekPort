package com.peekport.dto;

import com.peekport.model.TransactionType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter
public class TransactionRequest {

    private String ticker;
    private String name;
    private String category;            // 주식, ETF 등
    private Long goalAccountId;

    private LocalDate tradeDate;
    private int quantity;
    private BigDecimal price;

    private TransactionType type;       // BUY, SELL 등
    private String memo;
}
