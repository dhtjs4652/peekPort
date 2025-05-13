package com.peekport.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoalAccountRequest {
    private String title;
    private Long totalAmount;
    private Long targetAmount;
}
