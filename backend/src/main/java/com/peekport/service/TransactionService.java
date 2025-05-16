package com.peekport.service;

import com.peekport.dto.TransactionRequest;
import com.peekport.model.*;
import com.peekport.repository.AssetRepository;
import com.peekport.repository.TransactionRepository;
import com.peekport.repository.UserRepository;
import com.peekport.repository.GoalAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final GoalAccountRepository goalAccountRepository;

    @Transactional
    public void registerTransaction(String email, TransactionRequest dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccount goal = goalAccountRepository.findById(dto.getGoalAccountId())
                .orElseThrow(() -> new RuntimeException("목표 계좌를 찾을 수 없습니다."));

        // 종목이 이미 존재하면 재사용, 없으면 생성
        Asset asset = assetRepository.findByTickerAndUser(dto.getTicker(), user)
                .orElseGet(() -> {
                    Asset newAsset = new Asset();
                    newAsset.setTicker(dto.getTicker());
                    newAsset.setName(dto.getName());
                    newAsset.setCategory(dto.getCategory());
                    newAsset.setUser(user);
                    newAsset.setGoalAccount(goal);
                    return assetRepository.save(newAsset);
                });

        Transaction tx = new Transaction();
        tx.setAsset(asset);
        tx.setTradeDate(dto.getTradeDate());
        tx.setQuantity(dto.getQuantity());
        tx.setPrice(dto.getPrice());
        tx.setType(dto.getType());
        tx.setMemo(dto.getMemo());

        transactionRepository.save(tx);
    }
}
