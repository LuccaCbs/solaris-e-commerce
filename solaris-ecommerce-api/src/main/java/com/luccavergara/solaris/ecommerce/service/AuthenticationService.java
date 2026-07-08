package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.AuthenticationRequest;
import com.luccavergara.solaris.ecommerce.dto.AuthenticationResponse;
import com.luccavergara.solaris.ecommerce.dto.RegisterRequest;
import com.luccavergara.solaris.ecommerce.entity.Role;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import com.luccavergara.solaris.ecommerce.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Value("${solaris.frontend.url}")
    private String frontendUrl;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe una cuenta registrada con ese correo electrónico");
        }

        String verificationToken = UUID.randomUUID().toString();

        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .emailVerified(false)
                .platformOperator(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        userRepository.save(user);

        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstname(), verificationUrl);

        return AuthenticationResponse.builder()
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .requiresVerification(true)
                .message("Registro exitoso. Revisa tu correo para verificar tu cuenta.")
                .build();
    }

    public AuthenticationResponse verifyEmail(String token) {
        var user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Token de verificación inválido"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("El correo ya fue verificado previamente");
        }

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token de verificación ha expirado. Solicita uno nuevo.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user.getEmail());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .message("Email verificado exitosamente")
                .build();
    }

    public void resendVerificationEmail(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No existe una cuenta con ese correo"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("El correo ya fue verificado");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstname(), verificationUrl);
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
