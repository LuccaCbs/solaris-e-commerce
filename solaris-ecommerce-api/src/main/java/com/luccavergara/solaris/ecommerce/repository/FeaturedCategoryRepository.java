package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.FeaturedCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeaturedCategoryRepository extends JpaRepository<FeaturedCategory, Long> {
    List<FeaturedCategory> findByActiveTrueOrderByDisplayOrderAsc();
    Optional<FeaturedCategory> findByCategoryId(Long categoryId);
}
