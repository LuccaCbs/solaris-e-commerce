package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductImageRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Image data is required")
    private String imageData; // Base64 encoded image data

    private Integer displayOrder = 0;
}
