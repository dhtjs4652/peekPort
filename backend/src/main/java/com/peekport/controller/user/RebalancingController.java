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

    @GetMapping("/{portfolioId}/rebalancing/status")
    public ResponseEntity<Boolean> checkRebalancingStatus(@PathVariable Long portfolioId) {

        try {
            log.info("리밸런싱 상태 체크 - Portfolio ID: {}", portfolioId);

            // 실제 포트폴리오 데이터로 주식/현금 비율 분석
            Boolean needsRebalancing = rebalancingService.checkAssetAllocationRebalancing(portfolioId);

            log.info("리밸런싱 필요 여부: {}", needsRebalancing);
            return ResponseEntity.ok(needsRebalancing);

        } catch (Exception e) {
            log.error("리밸런싱 상태 체크 API 오류", e);
            return ResponseEntity.badRequest().build();
        }
    }

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

    @PutMapping("/{portfolioId}/rebalancing/target-allocation")
    public ResponseEntity<String> updateTargetAllocation(
            @PathVariable Long portfolioId,
            @RequestParam Double stockRatio,
            @RequestParam Double cashRatio) {

        try {
            log.info("목표 자산 배분 설정 - Portfolio ID: {}, Stock: {}%, Cash: {}%",
                    portfolioId, stockRatio, cashRatio);

            // 비율 검증
            if (Math.abs(stockRatio + cashRatio - 100.0) > 0.01) {
                return ResponseEntity.badRequest().body("주식과 현금 비율의 합이 100%가 되어야 합니다.");
            }

            if (stockRatio < 0 || stockRatio > 100 || cashRatio < 0 || cashRatio > 100) {
                return ResponseEntity.badRequest().body("비율은 0%에서 100% 사이여야 합니다.");
            }

            return ResponseEntity.ok(String.format("목표 자산 배분이 설정되었습니다. (주식 %.1f%%, 현금 %.1f%%)",
                    stockRatio, cashRatio));

        } catch (Exception e) {
            log.error("목표 자산 배분 설정 API 오류", e);
            return ResponseEntity.badRequest().body("목표 비율 설정 실패");
        }
    }
}