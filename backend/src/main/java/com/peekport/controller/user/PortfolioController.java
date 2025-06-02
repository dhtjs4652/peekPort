package com.peekport.controller.user;

import com.peekport.dto.*;
import com.peekport.model.User;
import com.peekport.repository.UserRepository;
import com.peekport.service.AssetService;
import com.peekport.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
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

    @PutMapping("/{portfolioId}/cash")
    public ResponseEntity<GoalAccountResponse> updateCash(
            @PathVariable Long portfolioId,
            @RequestBody UpdateCashRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws AccessDeniedException {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccountResponse response = portfolioService.updateCash(portfolioId, request.getCash(), user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{portfolioId}/target")  // ← portfolioId로 통일
    public ResponseEntity<GoalAccountResponse> updateTargetAmount(
            @PathVariable Long portfolioId,  // ← portfolioId로 통일
            @RequestBody UpdateTargetRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) throws AccessDeniedException {  // ← 예외 처리 추가
        User user = userRepository.findByEmail(userDetails.getUsername())  // ← User 객체 생성
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccountResponse response = portfolioService.updateTargetAmount(
                portfolioId,  // ← portfolioId 사용
                request.getTargetAmount(),
                user  // ← User 객체 전달
        );
        return ResponseEntity.ok(response);
    }

}