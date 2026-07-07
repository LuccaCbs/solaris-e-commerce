package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
