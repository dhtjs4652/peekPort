package com.peekport.repository;

import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalAccountRepository extends JpaRepository<GoalAccount, Long> {
    List<GoalAccount> findByUserId(Long userId);
    List<GoalAccount> findByUser(User user);
    List<GoalAccount> findByUserOrderByCreatedAtDesc(User user); // 생성일 순 정리

}
