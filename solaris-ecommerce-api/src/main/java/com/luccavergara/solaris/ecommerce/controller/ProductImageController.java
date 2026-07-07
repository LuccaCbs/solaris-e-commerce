package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.ProductImageRequest;
import com.luccavergara.solaris.ecommerce.dto.ProductImageResponse;
import com.luccavergara.solaris.ecommerce.service.ProductImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ProductImageResponse> addProductImage(
            @PathVariable Long productId,
            @Valid @RequestBody ProductImageRequest request,
            @RequestHeader("X-User-Id") Long userId
    ) {
        request.setProductId(productId);
        return ResponseEntity.ok(productImageService.addProductImage(request, userId));
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<ProductImageResponse> getProductImage(@PathVariable Long imageId) {
        return ResponseEntity.ok(productImageService.getProductImageById(imageId));
    }

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getProductImagesByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(productImageService.getProductImagesByProductId(productId));
    }

    @PutMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<ProductImageResponse> updateProductImage(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @Valid @RequestBody ProductImageRequest request
    ) {
        request.setProductId(productId);
        return ResponseEntity.ok(productImageService.updateProductImage(imageId, request));
    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteProductImage(@PathVariable Long imageId) {
        productImageService.deleteProductImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
