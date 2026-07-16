package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProductFormRequest {
    @NotNull(message = "Product id is required")
    private Long productId;

    private Boolean active = true;

    @NotEmpty(message = "At least one field is required")
    @Valid
    private List<ProductFormFieldRequest> fields;
}
