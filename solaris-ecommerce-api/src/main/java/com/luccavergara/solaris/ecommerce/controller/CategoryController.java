package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.CategoryRequest;
import com.luccavergara.solaris.ecommerce.dto.CategoryResponse;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(categoryService.createCategory(request, user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @GetMapping("/general")
    public ResponseEntity<CategoryResponse> getGeneralCategory() {
        return ResponseEntity.ok(categoryService.getGeneralCategory());
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<CategoryResponse> toggleCategoryStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(categoryService.toggleCategoryStatus(id, active));
    }
}
