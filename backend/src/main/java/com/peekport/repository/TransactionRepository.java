package com.peekport.repository;

import com.peekport.model.Transaction;
import com.peekport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAssetUser(User user);
}
