package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Valid
    private java.util.List<ProductOrderDetailRequest> details;
}
