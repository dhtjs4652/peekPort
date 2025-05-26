package com.peekport.service;

import com.peekport.dto.PortfolioSummaryResponse;
import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import com.peekport.repository.AssetRepository;
import com.peekport.repository.GoalAccountRepository;
import com.peekport.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
// RoundingMode가 안 되는 경우를 대비해 String.format 대안 사용
import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final GoalAccountRepository goalAccountRepository;
    private final UserRepository userRepository;

    public AssetService(AssetRepository assetRepository,
                        GoalAccountRepository goalAccountRepository,
                        UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.goalAccountRepository = goalAccountRepository;
        this.userRepository = userRepository;
    }

    public PortfolioSummaryResponse calculatePortfolioSummary(Long portfolioId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GoalAccount goalAccount = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("Not your portfolio"));

        List<Asset> assets = assetRepository.findByGoalAccountAndUser(goalAccount, user);

        BigDecimal totalInvestment = BigDecimal.ZERO;
        BigDecimal totalValue = BigDecimal.ZERO;

        for (Asset asset : assets) {
            BigDecimal investment = asset.getPurchasePrice().multiply(BigDecimal.valueOf(asset.getQuantity()));
            BigDecimal current = asset.getCurrentPrice().multiply(BigDecimal.valueOf(asset.getQuantity()));
            totalInvestment = totalInvestment.add(investment);
            totalValue = totalValue.add(current);
        }

        BigDecimal profitLoss = totalValue.subtract(totalInvestment);
        double returnRate = 0.0;

        if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal rawRate = profitLoss.multiply(BigDecimal.valueOf(100)).divide(totalInvestment, 6, BigDecimal.ROUND_HALF_UP);
            returnRate = Double.parseDouble(String.format("%.2f", rawRate));
        }

        return new PortfolioSummaryResponse(
                portfolioId,
                totalInvestment,
                totalValue,
                profitLoss,
                returnRate
        );
    }

}
