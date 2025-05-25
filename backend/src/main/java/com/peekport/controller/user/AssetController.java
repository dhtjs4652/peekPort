package com.peekport.controller.user;

import com.peekport.dto.AssetRequest;
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

    @GetMapping("/{portfolioId}/stocks/{stockId}")
    public ResponseEntity<AssetResponse> getAssetDetail(
            @PathVariable Long portfolioId,
            @PathVariable Long stockId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("이 포트폴리오에 접근할 수 없습니다."));

        Asset asset = assetRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("종목을 찾을 수 없습니다."));

        if (!asset.getGoalAccount().getId().equals(portfolioId) || !asset.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("이 종목에 접근할 수 없습니다.");
        }

        return ResponseEntity.ok(new AssetResponse(asset));
    }

    @PostMapping("/{portfolioId}/stocks")
    public ResponseEntity<AssetResponse> addAsset(
            @PathVariable Long portfolioId,
            @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("이 포트폴리오에 접근할 수 없습니다."));

        Asset asset = new Asset();
        asset.setName(request.getName());
        asset.setTicker(request.getTicker());
        asset.setQuantity(request.getQuantity());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setCurrentPrice(request.getCurrentPrice() != null ? request.getCurrentPrice() : request.getPurchasePrice());
        asset.setTerm(request.getTerm());
        asset.setUser(user);
        asset.setGoalAccount(goal);

        Asset saved = assetRepository.save(asset);
        return ResponseEntity.ok(new AssetResponse(saved));
    }

    @DeleteMapping("/{portfolioId}/stocks/{stockId}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long stockId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 포트폴리오 접근 권한 확인
        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("이 포트폴리오에 접근할 수 없습니다."));

        // 종목 존재 및 권한 확인
        Asset asset = assetRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("종목을 찾을 수 없습니다."));

        // 종목이 해당 포트폴리오에 속하고 현재 사용자 소유인지 확인
        if (!asset.getGoalAccount().getId().equals(portfolioId) || !asset.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("이 종목에 접근할 수 없습니다.");
        }

        assetRepository.delete(asset);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{portfolioId}/stocks/{stockId}")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable Long portfolioId,
            @PathVariable Long stockId,
            @RequestBody AssetRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 포트폴리오 접근 권한 확인
        GoalAccount goal = goalAccountRepository.findByIdAndUserId(portfolioId, user.getId())
                .orElseThrow(() -> new AccessDeniedException("이 포트폴리오에 접근할 수 없습니다."));

        // 종목 존재 및 권한 확인
        Asset asset = assetRepository.findById(stockId)
                .orElseThrow(() -> new RuntimeException("종목을 찾을 수 없습니다."));

        // 종목이 해당 포트폴리오에 속하고 현재 사용자 소유인지 확인
        if (!asset.getGoalAccount().getId().equals(portfolioId) || !asset.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("이 종목에 접근할 수 없습니다.");
        }

        // 종목 정보 업데이트
        asset.setName(request.getName());
        asset.setTicker(request.getTicker());
        asset.setQuantity(request.getQuantity());
        asset.setPurchasePrice(request.getPurchasePrice());
        asset.setCurrentPrice(request.getCurrentPrice() != null ? request.getCurrentPrice() : request.getPurchasePrice());
        asset.setTerm(request.getTerm());

        Asset updated = assetRepository.save(asset);
        return ResponseEntity.ok(new AssetResponse(updated));
    }
}