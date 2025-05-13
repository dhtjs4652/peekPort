package com.peekport.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class GoalAccountResponse {
    private Long id;
    private String title;
    private Long totalAmount;
    private Long targetAmount;
}
