package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Long customerId;

    private Long userId;

    private String shippingAddress;

    private String billingAddress;

    private String paymentMethod;

    private String paymentReference;

    private String notes;

    private BigDecimal taxAmount;

    private BigDecimal shippingAmount;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;
}
