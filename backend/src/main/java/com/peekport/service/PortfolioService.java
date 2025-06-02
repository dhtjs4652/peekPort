package com.peekport.service;

import com.peekport.dto.GoalAccountRequest;
import com.peekport.dto.GoalAccountResponse;
import com.peekport.model.GoalAccount;
import com.peekport.model.PortfolioType;
import com.peekport.model.User;
import com.peekport.repository.GoalAccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.nio.file.AccessDeniedException;
import java.util.List;

@Service
public class PortfolioService {

    private final GoalAccountRepository goalAccountRepository;
    private final AssetService assetService;

    public PortfolioService(GoalAccountRepository goalAccountRepository, AssetService assetService) {
        this.goalAccountRepository = goalAccountRepository;
        this.assetService = assetService;
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
        // portfolio.setTotalAmount(request.getTotalAmount()); // 제거: 더 이상 수동 입력 사용 안 함
        portfolio.setTargetAmount(request.getTargetAmount());
        portfolio.setCash(request.getCash() != null ? request.getCash() : BigDecimal.ZERO);
        portfolio.setPortfolioType(
                request.getPortfolioType() != null ? request.getPortfolioType() : PortfolioType.BALANCED
        );

        GoalAccount saved = goalAccountRepository.save(portfolio);
        BigDecimal calculatedTotal = assetService.calculateTotalAssets(saved);

        return new GoalAccountResponse(
                saved.getId(),
                saved.getName(),
                calculatedTotal,        // ✅ 계산된 총 자산 사용
                saved.getTargetAmount(),
                saved.getCash(),
                saved.getPortfolioType()
        );
    }

    public List<GoalAccountResponse> getPortfoliosByUser(User user) {
        List<GoalAccount> list = goalAccountRepository.findByUser(user);
        return list.stream()
                .map(p -> {
                    BigDecimal calculatedTotal = assetService.calculateTotalAssets(p);
                    return new GoalAccountResponse(
                            p.getId(),
                            p.getName(),
                            calculatedTotal,        // ✅ 계산된 총 자산 사용
                            p.getTargetAmount(),
                            p.getCash(),
                            p.getPortfolioType()
                    );
                })
                .toList();
    }

    public GoalAccountResponse updateCash(Long portfolioId, BigDecimal cash, User user) throws AccessDeniedException {
        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("해당 포트폴리오에 접근할 수 없습니다."));

        goal.setCash(cash);
        GoalAccount updated = goalAccountRepository.save(goal);
        BigDecimal calculatedTotal = assetService.calculateTotalAssets(updated); // ✅ 자동 계산

        return new GoalAccountResponse(
                updated.getId(),
                updated.getName(),
                calculatedTotal,        // ✅ 계산된 총 자산 사용
                updated.getTargetAmount(),
                updated.getCash(),
                updated.getPortfolioType()
        );
    }

    public GoalAccountResponse updateTargetAmount(Long portfolioId, Long newTargetAmount, User user) throws AccessDeniedException {
        GoalAccount account = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("해당 포트폴리오에 접근할 수 없습니다."));

        account.setTargetAmount(newTargetAmount);
        goalAccountRepository.save(account);

        return new GoalAccountResponse(
                account.getId(),
                account.getName(),
                account.getTotalAmount(),
                account.getTargetAmount(),
                account.getCash(),
                account.getPortfolioType()
        );
    }

}