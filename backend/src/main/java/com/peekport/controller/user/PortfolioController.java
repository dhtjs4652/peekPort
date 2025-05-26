package com.peekport.controller.user;

import com.peekport.dto.GoalAccountRequest;
import com.peekport.dto.GoalAccountResponse;
import com.peekport.dto.PortfolioSummaryResponse;
import com.peekport.model.User;
import com.peekport.repository.UserRepository;
import com.peekport.service.AssetService;
import com.peekport.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserRepository userRepository;
    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<GoalAccountResponse> createPortfolio(
            @RequestBody GoalAccountRequest request,
            @AuthenticationPrincipal UserDetails userDetails // String email 대신 UserDetails로 변경
    ) {
        // 이메일로 User 객체 조회
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 서비스로 위임
        GoalAccountResponse response = portfolioService.createPortfolio(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GoalAccountResponse>> getPortfolios(
            @AuthenticationPrincipal UserDetails userDetails // 여기도 UserDetails로 변경
    ) {
        User realUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GoalAccountResponse> response = portfolioService.getPortfoliosByUser(realUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{portfolioId}/summary")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolioSummary(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        PortfolioSummaryResponse response = assetService.calculatePortfolioSummary(
                portfolioId, userDetails.getUsername()
        );
        return ResponseEntity.ok(response);
    }
}