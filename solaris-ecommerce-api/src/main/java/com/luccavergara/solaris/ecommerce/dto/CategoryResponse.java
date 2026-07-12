package com.luccavergara.solaris.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private Boolean systemCategory;
    private Boolean active;
    private Long parentId;
    private String parentName;
    private String imageData;
    private String categoryType;
    private Long productId;
    private String productName;
    private List<CategoryResponse> subcategories;
}
