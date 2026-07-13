package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.FeaturedCategoryRequest;
import com.luccavergara.solaris.ecommerce.dto.FeaturedCategoryResponse;
import com.luccavergara.solaris.ecommerce.service.FeaturedCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/featured-categories")
@RequiredArgsConstructor
public class FeaturedCategoryController {

    private final FeaturedCategoryService featuredCategoryService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<FeaturedCategoryResponse>> getAll() {
        return ResponseEntity.ok(featuredCategoryService.getAllForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedCategoryResponse> create(@Valid @RequestBody FeaturedCategoryRequest request) {
        return ResponseEntity.ok(featuredCategoryService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FeaturedCategoryRequest request
    ) {
        return ResponseEntity.ok(featuredCategoryService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedCategoryResponse> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(featuredCategoryService.toggleActive(id, active));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        featuredCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
