package com.luccavergara.solaris.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    private Long id;
    
    @NotBlank(message = "Razón social is required")
    private String razonSocial;
    
    @NotBlank(message = "CUIT is required")
    private String cuit;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String phone;
    
    private String address;
    
    private String city;
    
    private String province;
    
    private String postalCode;
    
    private String country;
    
    private String condicionIva;
    
    private Boolean active;
}
