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

        Category parent = resolveParent(request.getParentId(), null);

        Category.CategoryType categoryType = request.getCategoryType() != null
                ? Category.CategoryType.valueOf(request.getCategoryType().toUpperCase())
                : (parent == null ? Category.CategoryType.MENU : Category.CategoryType.SUBMENU);

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .systemCategory(false)
                .active(true)
                .user(user)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .parent(parent)
                .imageData(request.getImageData())
                .categoryType(categoryType)
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
        category.setParent(resolveParent(request.getParentId(), id));
        if (request.getImageData() != null) {
            category.setImageData(request.getImageData());
        }
        if (request.getCategoryType() != null) {
            category.setCategoryType(Category.CategoryType.valueOf(request.getCategoryType().toUpperCase()));
        }

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    private Category resolveParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return null;
        }
        if (selfId != null && parentId.equals(selfId)) {
            throw new RuntimeException("Una categoría no puede ser su propia categoría padre");
        }
        Category parent = categoryRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Categoría padre no encontrada"));
        // Allow 3 levels: MENU -> SUBMENU -> ITEM
        if (parent.getParent() != null && parent.getParent().getParent() != null) {
            throw new RuntimeException("Solo se admiten 3 niveles de jerarquía (MENU -> SUBMENU -> ITEM)");
        }
        return parent;
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

    public List<CategoryResponse> getCategoryTree() {
        return categoryRepository.findByParentIsNull().stream()
                .filter(category -> Boolean.TRUE.equals(category.getActive()))
                .map(category -> {
                    CategoryResponse response = mapToResponse(category);
                    List<CategoryResponse> children = categoryRepository.findByParentId(category.getId()).stream()
                            .filter(child -> Boolean.TRUE.equals(child.getActive()))
                            .map(this::mapToResponse)
                            .collect(Collectors.toList());
                    response.setSubcategories(children);
                    return response;
                })
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
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .imageData(category.getImageData())
                .categoryType(category.getCategoryType() != null ? category.getCategoryType().name() : null)
                .build();
    }
}
