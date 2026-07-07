package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.ProductImageRequest;
import com.luccavergara.solaris.ecommerce.dto.ProductImageResponse;
import com.luccavergara.solaris.ecommerce.entity.Product;
import com.luccavergara.solaris.ecommerce.entity.ProductImage;
import com.luccavergara.solaris.ecommerce.repository.ProductImageRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductImageService {

    private final ProductImageRepository productImageRepository;
    private final ProductRepository productRepository;

    public ProductImageResponse addProductImage(ProductImageRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Encriptar la imagen (simulado con Base64 por ahora)
        String encryptedImageData = encryptImageData(request.getImageData());

        ProductImage productImage = ProductImage.builder()
                .product(product)
                .encryptedData(encryptedImageData)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        productImage = productImageRepository.save(productImage);
        return mapToResponse(productImage);
    }

    public ProductImageResponse updateProductImage(Long id, ProductImageRequest request) {
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found"));

        if (request.getImageData() != null) {
            String encryptedImageData = encryptImageData(request.getImageData());
            productImage.setEncryptedData(encryptedImageData);
        }

        if (request.getDisplayOrder() != null) {
            productImage.setDisplayOrder(request.getDisplayOrder());
        }

        productImage = productImageRepository.save(productImage);
        return mapToResponse(productImage);
    }

    public ProductImageResponse getProductImageById(Long id) {
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found"));
        return mapToResponse(productImage);
    }

    public List<ProductImageResponse> getProductImagesByProductId(Long productId) {
        List<ProductImage> images = productImageRepository.findByProductIdAndActiveTrue(productId);
        return images.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteProductImage(Long id) {
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found"));

        // Soft delete
        productImage.setActive(false);
        productImageRepository.save(productImage);
    }

    public void deleteProductImagePermanently(Long id) {
        ProductImage productImage = productImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product image not found"));

        productImageRepository.delete(productImage);
    }

    private String encryptImageData(String imageData) {
        // Simulación de encriptación - en producción usar AES u otro algoritmo
        try {
            // Por ahora solo retornamos el dato base64
            // En producción: usar AES encryption
            return imageData;
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting image data", e);
        }
    }

    private String decryptImageData(String encryptedData) {
        // Simulación de desencriptación
        try {
            return encryptedData;
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting image data", e);
        }
    }

    private ProductImageResponse mapToResponse(ProductImage productImage) {
        return ProductImageResponse.builder()
                .id(productImage.getId())
                .productId(productImage.getProduct() != null ? productImage.getProduct().getId() : null)
                .imageData(decryptImageData(productImage.getEncryptedData()))
                .displayOrder(productImage.getDisplayOrder())
                .active(productImage.getActive())
                .createdAt(productImage.getCreatedAt())
                .build();
    }
}
