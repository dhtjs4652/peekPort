package com.peekport.repository;

import com.peekport.model.GoalAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalAccountRepository extends JpaRepository<GoalAccount, Long> {
    List<GoalAccount> findByUserId(Long userId);
}
