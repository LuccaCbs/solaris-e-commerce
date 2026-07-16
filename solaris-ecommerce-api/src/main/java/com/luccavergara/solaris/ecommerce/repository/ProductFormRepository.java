package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.ProductForm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductFormRepository extends JpaRepository<ProductForm, Long> {
    Optional<ProductForm> findByProduct_Id(Long productId);

    List<ProductForm> findAllByOrderByUpdatedAtDesc();
}
