package com.luccavergara.solaris.ecommerce.dto;

import com.luccavergara.solaris.ecommerce.entity.AuthProvider;
import com.luccavergara.solaris.ecommerce.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private String phone;
    private String address;
    private Role role;
    private AuthProvider authProvider;
    private Boolean emailVerified;
    private Boolean platformOperator;
    private LocalDateTime createdAt;
}
