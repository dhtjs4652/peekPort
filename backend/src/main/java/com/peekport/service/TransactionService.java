package com.peekport.service;

import com.peekport.dto.TransactionRequest;
import com.peekport.dto.TransactionResponse;
import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.model.Transaction;
import com.peekport.model.User;
import com.peekport.repository.AssetRepository;
import com.peekport.repository.GoalAccountRepository;
import com.peekport.repository.TransactionRepository;
import com.peekport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AssetRepository assetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final GoalAccountRepository goalAccountRepository;

    @Transactional
    public Transaction registerTransaction(String email, TransactionRequest dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        GoalAccount goal = goalAccountRepository.findByIdAndUser(dto.getGoalAccountId(), user)
                .orElseThrow(() -> new RuntimeException("사용자 소유의 목표 계좌가 아닙니다."));

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
        tx.setQuantity(dto.getQuantity().intValue());
        tx.setPrice(BigDecimal.valueOf(dto.getPrice()));
        tx.setType(dto.getType());
        tx.setMemo(dto.getMemo());

        return transactionRepository.save(tx);
    }

    // 이메일 기반 유저 정보 확인
    public List<TransactionResponse> getTransactionsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Transaction> transactions = transactionRepository.findByAssetUser(user);

        return transactions.stream()
                .map(TransactionResponse::new)
                .toList();
    }

}
