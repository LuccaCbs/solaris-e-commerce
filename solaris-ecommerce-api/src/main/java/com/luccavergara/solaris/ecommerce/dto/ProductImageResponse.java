package com.luccavergara.solaris.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageResponse {
    private Long id;
    private Long productId;
    private String imageData; // Base64 encoded image data
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime createdAt;
}
