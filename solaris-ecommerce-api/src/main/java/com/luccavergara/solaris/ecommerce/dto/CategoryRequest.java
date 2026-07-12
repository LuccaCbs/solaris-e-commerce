package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private Boolean systemCategory = false;

    private Long parentId;

    private String imageData;

    private String categoryType;

    private Long productId;
}
