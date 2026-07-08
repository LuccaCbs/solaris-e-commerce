package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.ProductRequest;
import com.luccavergara.solaris.ecommerce.dto.ProductResponse;
import com.luccavergara.solaris.ecommerce.entity.Category;
import com.luccavergara.solaris.ecommerce.entity.Product;
import com.luccavergara.solaris.ecommerce.entity.ProductIvaRate;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.CategoryRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import com.luccavergara.solaris.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductResponse createProduct(ProductRequest request, Long userId) {
        if (productRepository.findByBarcode(request.getBarcode()).isPresent()) {
            throw new RuntimeException("Product with this barcode already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .barcode(request.getBarcode())
                .barcodeFormat(request.getBarcodeFormat())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .lowStockThreshold(request.getLowStockThreshold())
                .category(category)
                .ivaRate(request.getIvaRate())
                .active(request.getActive())
                .user(user)
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getBarcode().equals(request.getBarcode())) {
            if (productRepository.findByBarcode(request.getBarcode()).isPresent()) {
                throw new RuntimeException("Product with this barcode already exists");
            }
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBarcode(request.getBarcode());
        product.setBarcodeFormat(request.getBarcodeFormat());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setLowStockThreshold(request.getLowStockThreshold());
        product.setCategory(category);
        product.setIvaRate(request.getIvaRate());
        product.setActive(request.getActive());

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return mapToResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<ProductResponse> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public List<ProductResponse> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }

    // Búsqueda y filtros avanzados
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable)
                .map(this::mapToResponse);
    }

    public Page<ProductResponse> advancedSearch(
            String search,
            Long categoryId,
            ProductIvaRate ivaRate,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {
        return productRepository.advancedSearch(search, categoryId, ivaRate, minPrice, maxPrice, pageable)
                .map(this::mapToResponse);
    }

    public Page<ProductResponse> getProductsByCategoryPaginated(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryAndActive(categoryId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ProductResponse> getProductsByIvaRate(ProductIvaRate ivaRate, Pageable pageable) {
        return productRepository.findByIvaRateAndActive(ivaRate, pageable)
                .map(this::mapToResponse);
    }

    private ProductResponse mapToResponse(Product product) {
        boolean lowStock = product.getLowStockThreshold() != null &&
                product.getStockQuantity() <= product.getLowStockThreshold();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .barcode(product.getBarcode())
                .barcodeFormat(product.getBarcodeFormat())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .lowStockThreshold(product.getLowStockThreshold())
                .createdAt(product.getCreatedAt())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .active(product.getActive())
                .ivaRate(product.getIvaRate())
                .lowStock(lowStock)
                .build();
    }
}
