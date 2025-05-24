package com.peekport.repository;

import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GoalAccountRepository extends JpaRepository<GoalAccount, Long> {
    List<GoalAccount> findByUserId(Long userId);
    List<GoalAccount> findByUser(User user);
    @Query("SELECT g FROM GoalAccount g WHERE g.id = :id AND g.user.id = :userId")
    Optional<GoalAccount> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    List<GoalAccount> findByUserOrderByCreatedAtDesc(User user); // 생성일 순 정리
}
