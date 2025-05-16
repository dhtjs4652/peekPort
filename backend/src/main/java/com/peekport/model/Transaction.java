package com.peekport.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    private LocalDate tradeDate;     // 거래일
    private int quantity;            // 수량
    private BigDecimal price;        // 매수가

    @Enumerated(EnumType.STRING)
    private TransactionType type;    // BUY, SELL 등

    private String memo;             // 메모 (선택)
}
