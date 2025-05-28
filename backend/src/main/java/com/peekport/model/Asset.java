package com.peekport.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String category;

    private String name;              // 종목 이름 (예: 삼성전자)
    private String ticker;            // 종목 코드 (예: 005930) - 선택사항

    private Integer quantity;         // 보유 수량
    private BigDecimal purchasePrice; // 매수가
    private BigDecimal currentPrice;  // 현재가 (실시간 업데이트용)

    private String term;              // 투자 기간 (short, mid, long)

    @Column(columnDefinition = "TEXT")
    private String memo;

    private LocalDateTime createdAt;  // 생성일시
    private LocalDateTime updatedAt;  // 수정일시

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_account_id")
    private GoalAccount goalAccount;  // 해당 종목이 소속된 포트폴리오

    // 목표 비중
    @Column(precision = 5, scale = 2)
    private BigDecimal targetRatio;  // 단위: %, 예: 15.50

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (currentPrice == null) {
            currentPrice = purchasePrice; // 초기값은 매수가와 동일
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}