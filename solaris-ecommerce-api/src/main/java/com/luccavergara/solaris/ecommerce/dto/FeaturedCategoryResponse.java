package com.luccavergara.solaris.ecommerce.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeaturedCategoryResponse {
    private Long id;
    private Long categoryId;
    private String name;
    private String description;
    private String imageData;
    private Integer displayOrder;
    private Boolean active;
}
