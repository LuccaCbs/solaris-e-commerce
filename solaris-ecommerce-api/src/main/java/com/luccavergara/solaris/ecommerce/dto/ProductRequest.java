package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.BarcodeFormat;
import com.luccavergara.solaris.ecommerce.entity.ProductIvaRate;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Barcode is required")
    @Size(max = 255, message = "Barcode must not exceed 255 characters")
    private String barcode;

    private BarcodeFormat barcodeFormat = BarcodeFormat.CODE_128;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @Min(value = 0, message = "Low stock threshold cannot be negative")
    private Integer lowStockThreshold;

    private Long categoryId;

    private ProductIvaRate ivaRate = ProductIvaRate.GENERAL_21;

    private Boolean active = true;
}
