package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.FeaturedCategoryRequest;
import com.luccavergara.solaris.ecommerce.dto.FeaturedCategoryResponse;
import com.luccavergara.solaris.ecommerce.entity.Category;
import com.luccavergara.solaris.ecommerce.entity.FeaturedCategory;
import com.luccavergara.solaris.ecommerce.repository.CategoryRepository;
import com.luccavergara.solaris.ecommerce.repository.FeaturedCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeaturedCategoryService {

    private final FeaturedCategoryRepository featuredCategoryRepository;
    private final CategoryRepository categoryRepository;

    public FeaturedCategoryResponse create(FeaturedCategoryRequest request) {
        Category category = getActiveCategory(request.getCategoryId());
        featuredCategoryRepository.findByCategoryId(request.getCategoryId()).ifPresent(existing -> {
            throw new RuntimeException("Esta categoría ya está expuesta en la tienda");
        });

        FeaturedCategory featured = FeaturedCategory.builder()
                .category(category)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(featuredCategoryRepository.save(featured));
    }

    public FeaturedCategoryResponse update(Long id, FeaturedCategoryRequest request) {
        FeaturedCategory featured = featuredCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría expuesta no encontrada"));

        if (request.getDisplayOrder() != null) {
            featured.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            featured.setActive(request.getActive());
        }
        if (request.getCategoryId() != null && !request.getCategoryId().equals(featured.getCategory().getId())) {
            Category category = getActiveCategory(request.getCategoryId());
            featuredCategoryRepository.findByCategoryId(request.getCategoryId()).ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Esta categoría ya está expuesta en la tienda");
                }
            });
            featured.setCategory(category);
        }

        return mapToResponse(featuredCategoryRepository.save(featured));
    }

    @Transactional(readOnly = true)
    public List<FeaturedCategoryResponse> getAllForAdmin() {
        return featuredCategoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeaturedCategoryResponse> getActiveForStorefront() {
        return featuredCategoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(featured -> Boolean.TRUE.equals(featured.getCategory().getActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FeaturedCategoryResponse toggleActive(Long id, boolean active) {
        FeaturedCategory featured = featuredCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría expuesta no encontrada"));
        featured.setActive(active);
        return mapToResponse(featuredCategoryRepository.save(featured));
    }

    public void delete(Long id) {
        FeaturedCategory featured = featuredCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría expuesta no encontrada"));
        featuredCategoryRepository.delete(featured);
    }

    private Category getActiveCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new RuntimeException("No se puede exponer una categoría inactiva");
        }
        if (Boolean.TRUE.equals(category.getSystemCategory())) {
            throw new RuntimeException("No se puede exponer una categoría del sistema");
        }
        return category;
    }

    private FeaturedCategoryResponse mapToResponse(FeaturedCategory featured) {
        Category category = featured.getCategory();
        return FeaturedCategoryResponse.builder()
                .id(featured.getId())
                .categoryId(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageData(category.getImageData())
                .displayOrder(featured.getDisplayOrder())
                .active(featured.getActive())
                .build();
    }
}
