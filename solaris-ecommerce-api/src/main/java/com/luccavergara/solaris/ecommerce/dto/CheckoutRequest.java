package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    @NotNull(message = "Cart identifier is required")
    private String cartIdentifier;

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String billingAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // MERCADOPAGO, STRIPE, etc.

    private String notes;
}
