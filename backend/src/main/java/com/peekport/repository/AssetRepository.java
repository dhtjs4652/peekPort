package com.peekport.repository;

import com.peekport.model.Asset;
import com.peekport.model.GoalAccount;
import com.peekport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByTickerAndUser(String ticker, User user);
    List<Asset> findByUser(User user);
    List<Asset> findByGoalAccountAndUser(GoalAccount goalAccount, User user);

    List<Asset> findByGoalAccountId(Long goalAccountId);

    @Query("SELECT COALESCE(SUM(a.quantity * a.currentPrice), 0) FROM Asset a WHERE a.goalAccount.id = :goalAccountId")
    Double getTotalStockValueByGoalAccountId(@Param("goalAccountId") Long goalAccountId);
}