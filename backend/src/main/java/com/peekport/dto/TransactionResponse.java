package com.peekport.dto;

import com.peekport.model.Transaction;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class TransactionResponse {

    private Long id;
    private String ticker;
    private Double quantity;
    private Double price;
    private LocalDate tradeDate;
    private String type;
    private String memo;

    public TransactionResponse(Transaction tx) {
        this.id = tx.getId();
        this.ticker = tx.getAsset().getTicker();
        this.quantity = (double) tx.getQuantity();
        this.price = tx.getPrice().doubleValue();
        this.tradeDate = tx.getTradeDate();
        this.type = tx.getType().name();
        this.memo = tx.getMemo();
    }
}
