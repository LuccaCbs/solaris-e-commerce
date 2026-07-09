package com.luccavergara.solaris.ecommerce.config;

import com.luccavergara.solaris.ecommerce.entity.AuthProvider;
import com.luccavergara.solaris.ecommerce.entity.Category;
import com.luccavergara.solaris.ecommerce.entity.Role;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.CategoryRepository;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DevAdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        User admin = userRepository.findByEmail("admin@local.dev")
                .orElseGet(this::createAdmin);
        seedGeneralCategory(admin);
    }

    private User createAdmin() {
        User admin = userRepository.save(User.builder()
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
        return admin;
    }

    private void seedGeneralCategory(User admin) {
        if (categoryRepository.findByNameIgnoreCase("GENERAL").isPresent()) {
            return;
        }

        categoryRepository.save(Category.builder()
                .name("GENERAL")
                .description("Categoría predeterminada del sistema")
                .systemCategory(true)
                .active(true)
                .user(admin)
                .createdBy(admin)
                .createdAt(LocalDateTime.now())
                .build());

        log.info("Categoría GENERAL del sistema creada");
    }
}
