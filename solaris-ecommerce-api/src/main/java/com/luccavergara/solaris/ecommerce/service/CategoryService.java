package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CategoryRequest;
import com.luccavergara.solaris.ecommerce.dto.CategoryResponse;
import com.luccavergara.solaris.ecommerce.dto.MenuProductSummary;
import com.luccavergara.solaris.ecommerce.entity.Category;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.CategoryRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CategoryResponse createCategory(CategoryRequest request, Long userId) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Ya existe una categoría con ese nombre");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category parent = resolveParent(request.getParentId(), null);
        Category.CategoryType categoryType = resolveCategoryType(request, parent);
        validateCategoryHierarchy(categoryType, parent);

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
                .product(null)
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

        Category parent = resolveParent(request.getParentId(), id);
        Category.CategoryType categoryType = request.getCategoryType() != null
                ? Category.CategoryType.valueOf(request.getCategoryType().toUpperCase())
                : category.getCategoryType();
        validateCategoryHierarchy(categoryType, parent);

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        if (request.getImageData() != null) {
            category.setImageData(request.getImageData());
        }
        category.setCategoryType(categoryType);
        category.setProduct(null);

        category = categoryRepository.save(category);
        return mapToResponse(category);
    }

    private Category.CategoryType resolveCategoryType(CategoryRequest request, Category parent) {
        if (request.getCategoryType() != null) {
            return Category.CategoryType.valueOf(request.getCategoryType().toUpperCase());
        }
        if (parent == null) {
            return Category.CategoryType.ITEM;
        }
        if (parent.getCategoryType() == Category.CategoryType.MENU) {
            return Category.CategoryType.SUBMENU;
        }
        return Category.CategoryType.ITEM;
    }

    private void validateCategoryHierarchy(Category.CategoryType type, Category parent) {
        switch (type) {
            case MENU -> {
                if (parent != null) {
                    throw new RuntimeException("Un menú principal no puede tener categoría padre");
                }
            }
            case SUBMENU -> {
                if (parent == null || parent.getCategoryType() != Category.CategoryType.MENU) {
                    throw new RuntimeException("Un sub-menú debe tener un menú principal como padre");
                }
            }
            case ITEM -> {
                // Categoría regular para productos; no forma parte del árbol de navegación manual
            }
        }
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
        if (Boolean.FALSE.equals(parent.getActive())) {
            throw new RuntimeException("No se puede asignar una categoría padre inactiva");
        }
        if (parent.getCategoryType() == Category.CategoryType.SUBMENU) {
            throw new RuntimeException("Una categoría solo puede tener como padre un menú principal");
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
                .filter(category -> !Boolean.TRUE.equals(category.getSystemCategory()))
                .filter(category -> category.getCategoryType() == Category.CategoryType.MENU)
                .map(this::buildMenuNode)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getFilterTree() {
        return categoryRepository.findByParentIsNull().stream()
                .filter(category -> Boolean.TRUE.equals(category.getActive()))
                .filter(category -> !Boolean.TRUE.equals(category.getSystemCategory()))
                .filter(category -> category.getCategoryType() == Category.CategoryType.MENU)
                .map(this::buildFilterMenuNode)
                .filter(menu -> menu.getSubcategories() != null && !menu.getSubcategories().isEmpty())
                .collect(Collectors.toList());
    }

    private CategoryResponse buildMenuNode(Category menu) {
        CategoryResponse response = mapToResponse(menu);
        List<CategoryResponse> submenus = categoryRepository.findByParentId(menu.getId()).stream()
                .filter(child -> Boolean.TRUE.equals(child.getActive()))
                .filter(child -> child.getCategoryType() == Category.CategoryType.SUBMENU)
                .map(this::buildSubmenuNode)
                .collect(Collectors.toList());
        response.setSubcategories(submenus);
        return response;
    }

    private CategoryResponse buildFilterMenuNode(Category menu) {
        CategoryResponse response = mapToResponse(menu);
        List<CategoryResponse> submenus = categoryRepository.findByParentId(menu.getId()).stream()
                .filter(child -> Boolean.TRUE.equals(child.getActive()))
                .filter(child -> child.getCategoryType() == Category.CategoryType.SUBMENU)
                .map(this::buildFilterSubmenuNode)
                .filter(submenu -> submenu.getProducts() != null && !submenu.getProducts().isEmpty())
                .collect(Collectors.toList());
        response.setSubcategories(submenus);
        return response;
    }

    private CategoryResponse buildSubmenuNode(Category submenu) {
        CategoryResponse response = mapToResponse(submenu);
        List<MenuProductSummary> products = productRepository.findByCategoryIdAndActiveTrue(submenu.getId()).stream()
                .map(product -> MenuProductSummary.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .build())
                .collect(Collectors.toList());
        response.setProducts(products);
        response.setSubcategories(Collections.emptyList());
        return response;
    }

    private CategoryResponse buildFilterSubmenuNode(Category submenu) {
        CategoryResponse response = mapToResponse(submenu);
        List<MenuProductSummary> products = productRepository.findByCategoryIdAndActiveTrue(submenu.getId()).stream()
                .map(product -> MenuProductSummary.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .build())
                .collect(Collectors.toList());
        response.setProducts(products);
        response.setSubcategories(Collections.emptyList());
        return response;
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
                .productId(category.getProduct() != null ? category.getProduct().getId() : null)
                .productName(category.getProduct() != null ? category.getProduct().getName() : null)
                .build();
    }
}
