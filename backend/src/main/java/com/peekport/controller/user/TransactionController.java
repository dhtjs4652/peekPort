package com.peekport.controller.user;

import com.peekport.dto.TransactionRequest;
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
    public ResponseEntity<Void> registerTransaction(@AuthenticationPrincipal UserDetails user,
                                                    @RequestBody TransactionRequest request) {
        transactionService.registerTransaction(user.getUsername(), request);
        return ResponseEntity.ok().build();
    }
}
