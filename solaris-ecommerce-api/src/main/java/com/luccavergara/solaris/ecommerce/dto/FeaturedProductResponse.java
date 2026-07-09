package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.CardType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class FeaturedProductResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productDescription;
    private BigDecimal price;
    private Integer stockQuantity;
    private String categoryName;
    private CardType cardType;
    private Integer displayOrder;
    private Boolean active;
    private List<ProductImageResponse> images;
}
