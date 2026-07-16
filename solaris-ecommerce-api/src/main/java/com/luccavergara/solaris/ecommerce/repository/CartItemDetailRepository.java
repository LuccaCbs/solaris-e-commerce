package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.CartItemDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemDetailRepository extends JpaRepository<CartItemDetail, Long> {
}
