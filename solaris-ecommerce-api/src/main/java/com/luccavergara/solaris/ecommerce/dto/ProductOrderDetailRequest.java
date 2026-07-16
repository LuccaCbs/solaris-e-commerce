package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductOrderDetailRequest {
    private Long productFormFieldId;

    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Field label is required")
    private String fieldLabel;

    @NotBlank(message = "Field value is required")
    private String fieldValue;
}
