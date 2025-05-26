package com.peekport.service;

import com.peekport.dto.GoalAccountRequest;
import com.peekport.dto.GoalAccountResponse;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import com.peekport.repository.GoalAccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.AccessDeniedException;
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
        portfolio.setName(request.getName());
        portfolio.setTotalAmount(request.getTotalAmount());
        portfolio.setTargetAmount(request.getTargetAmount());
        portfolio.setCash(request.getCash() != null ? request.getCash() : BigDecimal.ZERO);

        GoalAccount saved = goalAccountRepository.save(portfolio);

        return new GoalAccountResponse(
                saved.getId(),
                saved.getName(),
                saved.getTotalAmount(),
                saved.getTargetAmount(),
                saved.getCash()
        );
    }

    public List<GoalAccountResponse> getPortfoliosByUser(User user) {
        List<GoalAccount> list = goalAccountRepository.findByUser(user);
        return list.stream()
                .map(p -> new GoalAccountResponse(
                        p.getId(),
                        p.getName(),
                        p.getTotalAmount(),
                        p.getTargetAmount(),
                        p.getCash()
                ))
                .toList();
    }

    public GoalAccountResponse updateCash(Long portfolioId, BigDecimal cash, User user) throws AccessDeniedException {
        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("해당 포트폴리오에 접근할 수 없습니다."));

        goal.setCash(cash);
        GoalAccount updated = goalAccountRepository.save(goal);

        return new GoalAccountResponse(
                updated.getId(),
                updated.getName(),
                updated.getTotalAmount(),
                updated.getTargetAmount(),
                updated.getCash()
        );
    }

}
