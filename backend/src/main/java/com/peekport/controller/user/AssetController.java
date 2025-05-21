package com.peekport.controller.user;

import com.peekport.dto.AssetResponse;
import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import com.peekport.repository.AssetRepository;
import com.peekport.repository.GoalAccountRepository;
import com.peekport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class AssetController {

    private final UserRepository userRepository;
    private final GoalAccountRepository goalAccountRepository;
    private final AssetRepository assetRepository;
    private final AssetRepository findByGoalAccountAndUser;

    @GetMapping("/{portfolioId}/stocks")
    public ResponseEntity<List<AssetResponse>> getAssetsByPortfolio(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccount goal = goalAccountRepository.findByIdAndUser(portfolioId, user)
                .orElseThrow(() -> new AccessDeniedException("이 포트폴리오에 접근할 수 없습니다."));

        List<Asset> assets = assetRepository.findByGoalAccountAndUser(goal, user);
        List<AssetResponse> responses = assets.stream()
                .map(AssetResponse::new)
                .toList();

        return ResponseEntity.ok(responses);
    }
}
