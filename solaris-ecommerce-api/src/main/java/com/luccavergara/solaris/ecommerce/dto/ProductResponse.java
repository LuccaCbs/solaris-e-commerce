package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.BarcodeFormat;
import com.luccavergara.solaris.ecommerce.entity.ProductIvaRate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String barcode;
    private BarcodeFormat barcodeFormat;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer lowStockThreshold;
    private LocalDateTime createdAt;
    private Long categoryId;
    private String categoryName;
    private Boolean active;
    private ProductIvaRate ivaRate;
    private Boolean lowStock;
    private Boolean madeToOrder;
}
