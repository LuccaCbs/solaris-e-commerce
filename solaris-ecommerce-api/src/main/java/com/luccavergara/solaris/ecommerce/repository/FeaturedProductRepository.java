package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.FeaturedProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeaturedProductRepository extends JpaRepository<FeaturedProduct, Long> {
    List<FeaturedProduct> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<FeaturedProduct> findByProductId(Long productId);
}
