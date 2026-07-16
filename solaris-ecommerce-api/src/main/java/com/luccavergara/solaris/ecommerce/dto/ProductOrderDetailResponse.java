package com.luccavergara.solaris.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductOrderDetailResponse {
    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long productId;
    private Long productFormFieldId;
    private String fieldKey;
    private String fieldLabel;
    private String fieldValue;
}
