package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.FeaturedProductRequest;
import com.luccavergara.solaris.ecommerce.dto.FeaturedProductResponse;
import com.luccavergara.solaris.ecommerce.dto.ProductImageResponse;
import com.luccavergara.solaris.ecommerce.entity.FeaturedProduct;
import com.luccavergara.solaris.ecommerce.entity.Product;
import com.luccavergara.solaris.ecommerce.repository.FeaturedProductRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FeaturedProductService {

    private final FeaturedProductRepository featuredProductRepository;
    private final ProductRepository productRepository;
    private final ProductImageService productImageService;

    public FeaturedProductResponse create(FeaturedProductRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new RuntimeException("No se puede exponer un producto deshabilitado");
        }

        featuredProductRepository.findByProductId(request.getProductId()).ifPresent(existing -> {
            throw new RuntimeException("Este producto ya está expuesto en la tienda");
        });

        FeaturedProduct featured = FeaturedProduct.builder()
                .product(product)
                .cardType(request.getCardType())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .createdAt(LocalDateTime.now())
                .build();

        return mapToResponse(featuredProductRepository.save(featured));
    }

    public FeaturedProductResponse update(Long id, FeaturedProductRequest request) {
        FeaturedProduct featured = featuredProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto expuesto no encontrado"));

        if (request.getCardType() != null) {
            featured.setCardType(request.getCardType());
        }
        if (request.getDisplayOrder() != null) {
            featured.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            featured.setActive(request.getActive());
        }

        return mapToResponse(featuredProductRepository.save(featured));
    }

    public List<FeaturedProductResponse> getAllForAdmin() {
        return featuredProductRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeaturedProductResponse> getActiveForStorefront() {
        return featuredProductRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(fp -> Boolean.TRUE.equals(fp.getProduct().getActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void delete(Long id) {
        FeaturedProduct featured = featuredProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto expuesto no encontrado"));
        featuredProductRepository.delete(featured);
    }

    public FeaturedProductResponse toggleActive(Long id, boolean active) {
        FeaturedProduct featured = featuredProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto expuesto no encontrado"));
        featured.setActive(active);
        return mapToResponse(featuredProductRepository.save(featured));
    }

    private FeaturedProductResponse mapToResponse(FeaturedProduct featured) {
        Product product = featured.getProduct();
        List<ProductImageResponse> images = productImageService.getProductImagesByProductId(product.getId());

        return FeaturedProductResponse.builder()
                .id(featured.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productDescription(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .cardType(featured.getCardType())
                .displayOrder(featured.getDisplayOrder())
                .active(featured.getActive())
                .images(images)
                .build();
    }
}
