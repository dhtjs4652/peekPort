package com.peekport.controller.user;

import com.peekport.dto.RebalancingRequest;
import com.peekport.dto.RebalancingResponse;
import com.peekport.service.RebalancingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class RebalancingController {

    private final RebalancingService rebalancingService;

    /**
     * 리밸런싱 분석 API
     * ±10% 이탈 기준으로 리밸런싱 필요 여부와 추천사항 제공
     */
    @PostMapping("/rebalancing/analyze")
    public ResponseEntity<RebalancingResponse> analyzeRebalancing(
            @Valid @RequestBody RebalancingRequest request) {

        try {
            log.info("리밸런싱 분석 요청 - Portfolio ID: {}", request.getPortfolioId());

            RebalancingResponse response = rebalancingService.analyzeRebalancing(request);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("리밸런싱 분석 API 오류", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 간단한 리밸런싱 상태 체크 API
     * 포트폴리오 ID만으로 현재 리밸런싱 필요 여부 확인
     */
    @GetMapping("/{portfolioId}/rebalancing/status")
    public ResponseEntity<Boolean> checkRebalancingStatus(@PathVariable Long portfolioId) {

        try {
            log.info("리밸런싱 상태 체크 - Portfolio ID: {}", portfolioId);

            // TODO: 포트폴리오 ID로 현재 보유 자산과 목표 비중을 조회하여 분석
            // 현재는 임시로 false 반환
            Boolean needsRebalancing = false;

            return ResponseEntity.ok(needsRebalancing);

        } catch (Exception e) {
            log.error("리밸런싱 상태 체크 API 오류", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 리밸런싱 알림 설정 API
     * 사용자가 리밸런싱 알림을 받을지 설정
     */
    @PutMapping("/{portfolioId}/rebalancing/notification")
    public ResponseEntity<String> updateRebalancingNotification(
            @PathVariable Long portfolioId,
            @RequestParam Boolean enabled) {

        try {
            log.info("리밸런싱 알림 설정 - Portfolio ID: {}, Enabled: {}", portfolioId, enabled);

            // TODO: 사용자의 리밸런싱 알림 설정을 DB에 저장

            String message = enabled ? "리밸런싱 알림이 활성화되었습니다." : "리밸런싱 알림이 비활성화되었습니다.";

            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("리밸런싱 알림 설정 API 오류", e);
            return ResponseEntity.badRequest().body("알림 설정 실패");
        }
    }
}