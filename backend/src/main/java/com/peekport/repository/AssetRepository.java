package com.peekport.repository;

import com.peekport.model.Asset;
import com.peekport.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    Optional<Asset> findByTickerAndUser(String ticker, User user);
    List<Asset> findByUser(User user);
}
