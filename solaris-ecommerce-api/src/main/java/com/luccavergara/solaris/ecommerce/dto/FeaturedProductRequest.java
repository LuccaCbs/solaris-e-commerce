package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.CardType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeaturedProductRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    private CardType cardType = CardType.BASIC;

    private Integer displayOrder = 0;

    private Boolean active = true;
}
