package com.luccavergara.solaris.ecommerce.config;

import com.luccavergara.solaris.ecommerce.entity.AuthProvider;
import com.luccavergara.solaris.ecommerce.entity.Role;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DevAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@local.dev")) {
            return;
        }

        userRepository.save(User.builder()
                .firstname("Admin")
                .lastname("Local")
                .email("admin@local.dev")
                .password(passwordEncoder.encode("admin123"))
                .authProvider(AuthProvider.LOCAL)
                .role(Role.ADMIN)
                .emailVerified(true)
                .platformOperator(false)
                .build());

        log.info("Usuario admin de desarrollo creado: admin@local.dev / admin123");
    }
}
