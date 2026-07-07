package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.StoreConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreConfigRepository extends JpaRepository<StoreConfig, Long> {
    Optional<StoreConfig> findByConfigKey(String configKey);
    List<StoreConfig> findByCategory(String category);
    List<StoreConfig> findByActiveTrue();
}
