package com.peekport.controller.user;

import com.peekport.dto.TransactionRequest;
import com.peekport.dto.TransactionResponse;
import com.peekport.model.Transaction;
import com.peekport.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// 반복되는 주소이니 전체 클래스단위에서 씀
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // 회원가입 요청
    @PostMapping
    public ResponseEntity<TransactionResponse> registerTransaction(@AuthenticationPrincipal UserDetails user,
                                                    @RequestBody TransactionRequest request) {
        Transaction tx = transactionService.registerTransaction(user.getUsername(), request);
        return ResponseEntity.ok(new TransactionResponse(tx));
    }

    // 거래 내역 조회 요청
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactions(@AuthenticationPrincipal UserDetails user) {
        List<TransactionResponse> responses = transactionService.getTransactionsByUser(user.getUsername());
        return ResponseEntity.ok(responses);
    }

}
