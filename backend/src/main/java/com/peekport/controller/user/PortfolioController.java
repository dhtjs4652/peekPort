package com.peekport.controller.user;

import com.peekport.dto.GoalAccountRequest;
import com.peekport.dto.GoalAccountResponse;
import com.peekport.model.User;
import com.peekport.repository.UserRepository;
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

    @PostMapping
    public ResponseEntity<GoalAccountResponse> createPortfolio(
            @RequestBody GoalAccountRequest request,
            @AuthenticationPrincipal String email // JwtFilter에서 등록된 이메일
    ) {
        // 이메일로 User 객체 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 서비스로 위임
        GoalAccountResponse response = portfolioService.createPortfolio(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GoalAccountResponse>> getPortfolios(
            @AuthenticationPrincipal UserDetails user
    ) {
        User realUser = userRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<GoalAccountResponse> response = portfolioService.getPortfoliosByUser(realUser);
        return ResponseEntity.ok(response);
    }

}
