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

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionResponse> registerTransaction(@AuthenticationPrincipal UserDetails user,
                                                    @RequestBody TransactionRequest request) {
        Transaction tx = transactionService.registerTransaction(user.getUsername(), request);
        return ResponseEntity.ok(new TransactionResponse(tx));
    }
}
