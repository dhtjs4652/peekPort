package com.peekport.service;

import com.peekport.dto.GoalAccountRequest;
import com.peekport.dto.GoalAccountResponse;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import com.peekport.repository.GoalAccountRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioService {

    private final GoalAccountRepository goalAccountRepository;

    public PortfolioService(GoalAccountRepository goalAccountRepository) {
        this.goalAccountRepository = goalAccountRepository;
    }

    // 포트폴리오 조회 메서드
    public List<GoalAccount> getPortfoliosByUserId(Long userId) {
        return goalAccountRepository.findByUserId(userId);
    }

    // 포트폴리오 등록 메서드
    public GoalAccount savePortfolio(GoalAccount portfolio, User user) {
        portfolio.setUser(user);
        return goalAccountRepository.save(portfolio);
    }

    public GoalAccountResponse createPortfolio(GoalAccountRequest request, User user) {
        GoalAccount portfolio = new GoalAccount();
        portfolio.setUser(user);
        portfolio.setTitle(request.getTitle());
        portfolio.setTotalAmount(request.getTotalAmount());
        portfolio.setTargetAmount(request.getTargetAmount());

        GoalAccount saved = goalAccountRepository.save(portfolio);

        return new GoalAccountResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getTotalAmount(),
                saved.getTargetAmount()
        );
    }
    // 추후: 포트폴리오 등록, 수정, 삭제 메서드 추가 예정
}
