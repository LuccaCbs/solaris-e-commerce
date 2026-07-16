package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.FormFieldType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductFormFieldRequest {
    private Long id;

    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    private String label;

    @NotNull(message = "Field type is required")
    private FormFieldType fieldType;

    private Boolean required = false;

    private Integer displayOrder = 0;

    private java.util.List<String> options;

    private String placeholder;
}
