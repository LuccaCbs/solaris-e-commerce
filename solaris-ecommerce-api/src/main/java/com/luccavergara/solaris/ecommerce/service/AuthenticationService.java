package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.AuthenticationRequest;
import com.luccavergara.solaris.ecommerce.dto.AuthenticationResponse;
import com.luccavergara.solaris.ecommerce.dto.RegisterRequest;
import com.luccavergara.solaris.ecommerce.entity.Role;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import com.luccavergara.solaris.ecommerce.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .platformOperator(false)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .build();
    }
}
