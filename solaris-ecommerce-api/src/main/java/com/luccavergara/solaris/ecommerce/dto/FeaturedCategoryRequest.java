package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeaturedCategoryRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private Integer displayOrder = 0;

    private Boolean active = true;
}
