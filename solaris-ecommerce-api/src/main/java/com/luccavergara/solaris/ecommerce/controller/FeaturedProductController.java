package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.FeaturedProductRequest;
import com.luccavergara.solaris.ecommerce.dto.FeaturedProductResponse;
import com.luccavergara.solaris.ecommerce.service.FeaturedProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/featured-products")
@RequiredArgsConstructor
public class FeaturedProductController {

    private final FeaturedProductService featuredProductService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<FeaturedProductResponse>> getAll() {
        return ResponseEntity.ok(featuredProductService.getAllForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedProductResponse> create(@Valid @RequestBody FeaturedProductRequest request) {
        return ResponseEntity.ok(featuredProductService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FeaturedProductRequest request
    ) {
        return ResponseEntity.ok(featuredProductService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<FeaturedProductResponse> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {
        return ResponseEntity.ok(featuredProductService.toggleActive(id, active));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        featuredProductService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
