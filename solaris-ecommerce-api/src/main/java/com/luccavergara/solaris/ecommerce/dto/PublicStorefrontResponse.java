package com.luccavergara.solaris.ecommerce.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PublicStorefrontResponse {
    private String displayMode;
    private List<FeaturedProductResponse> products;
}
