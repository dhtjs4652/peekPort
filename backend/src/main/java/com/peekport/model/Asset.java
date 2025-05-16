package com.peekport.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ticker;        // 종목 코드 (예: AAPL)
    private String name;          // 종목 이름 (예: Apple)

    private String category;      // 자산 카테고리 (예: 주식, ETF, 현금 등)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_account_id")
    private GoalAccount goalAccount;  // 해당 종목이 소속된 포트폴리오
}
