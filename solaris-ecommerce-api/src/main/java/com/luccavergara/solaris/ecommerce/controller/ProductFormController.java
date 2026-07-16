package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.ProductFormRequest;
import com.luccavergara.solaris.ecommerce.dto.ProductFormResponse;
import com.luccavergara.solaris.ecommerce.service.ProductFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-forms")
@RequiredArgsConstructor
public class ProductFormController {

    private final ProductFormService productFormService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<List<ProductFormResponse>> getAllForms() {
        return ResponseEntity.ok(productFormService.getAllForms());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ProductFormResponse> getFormById(@PathVariable Long id) {
        return ResponseEntity.ok(productFormService.getFormById(id));
    }

    @GetMapping("/by-product/{productId}")
    public ResponseEntity<ProductFormResponse> getFormByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(productFormService.getFormByProductId(productId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ProductFormResponse> createForm(@Valid @RequestBody ProductFormRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productFormService.createForm(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ProductFormResponse> updateForm(
            @PathVariable Long id,
            @Valid @RequestBody ProductFormRequest request
    ) {
        return ResponseEntity.ok(productFormService.updateForm(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        productFormService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }
}
