package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.ProductOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductOrderDetailRepository extends JpaRepository<ProductOrderDetail, Long> {
    List<ProductOrderDetail> findByOrderItemId(Long orderItemId);

    List<ProductOrderDetail> findByOrderId(Long orderId);
}
