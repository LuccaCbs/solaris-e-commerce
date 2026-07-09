package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.CardType;
import lombok.Data;

@Data
public class FeaturedProductUpdateRequest {
    private CardType cardType;
    private Integer displayOrder;
    private Boolean active;
}
