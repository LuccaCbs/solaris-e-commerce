package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CategoryRequest;
import com.luccavergara.solaris.ecommerce.dto.CategoryResponse;
import com.luccavergara.solaris.ecommerce.entity.Category;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.CategoryRepository;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryResponse createCategory(CategoryRequest request, Long userId) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .systemCategory(false)
                .active(true)
                .user(user)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (Boolean.TRUE.equals(category.getSystemCategory())) {
            throw new RuntimeException("La categoría GENERAL del sistema no puede modificarse");
        }

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToResponse(category);
    }

    public CategoryResponse getGeneralCategory() {
        Category category = categoryRepository.findByNameIgnoreCase("GENERAL")
                .orElseThrow(() -> new RuntimeException("Categoría GENERAL no encontrada"));
        return mapToResponse(category);
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteCategory(Long id) {
        toggleCategoryStatus(id, false);
    }

    public CategoryResponse toggleCategoryStatus(Long id, boolean active) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (Boolean.TRUE.equals(category.getSystemCategory())) {
            throw new RuntimeException("La categoría GENERAL del sistema no puede deshabilitarse");
        }

        category.setActive(active);
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .systemCategory(category.getSystemCategory())
                .active(category.getActive())
                .build();
    }
}
