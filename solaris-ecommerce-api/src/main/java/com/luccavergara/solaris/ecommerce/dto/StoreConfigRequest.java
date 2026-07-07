package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StoreConfigRequest {
    @NotBlank(message = "Config key is required")
    private String configKey;

    @NotBlank(message = "Config value is required")
    private String configValue;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private Boolean active;
}
