package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.FormFieldType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFormFieldResponse {
    private Long id;
    private String fieldKey;
    private String label;
    private FormFieldType fieldType;
    private Boolean required;
    private Integer displayOrder;
    private List<String> options;
    private String placeholder;
}
