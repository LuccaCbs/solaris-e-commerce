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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductResponse createProduct(ProductRequest request, Long userId) {
        String barcode = resolveBarcode(request.getBarcode());

        if (productRepository.findByBarcode(barcode).isPresent()) {
            throw new RuntimeException("Ya existe un producto con ese código de barras");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = resolveCategory(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .barcode(barcode)
                .barcodeFormat(request.getBarcodeFormat())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .lowStockThreshold(request.getLowStockThreshold())
                .category(category)
                .ivaRate(request.getIvaRate())
                .active(request.getActive() != null ? request.getActive() : true)
                .madeToOrder(request.getMadeToOrder() != null ? request.getMadeToOrder() : false)
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

        String barcode = request.getBarcode() != null && !request.getBarcode().isBlank()
                ? request.getBarcode()
                : product.getBarcode();

        if (!product.getBarcode().equals(barcode)
                && productRepository.findByBarcode(barcode).isPresent()) {
            throw new RuntimeException("Ya existe un producto con ese código de barras");
        }

        Category category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"))
                : product.getCategory();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBarcode(barcode);
        if (request.getBarcodeFormat() != null) {
            product.setBarcodeFormat(request.getBarcodeFormat());
        }
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setLowStockThreshold(request.getLowStockThreshold());
        product.setCategory(category);
        if (request.getIvaRate() != null) {
            product.setIvaRate(request.getIvaRate());
        }
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }
        if (request.getMadeToOrder() != null) {
            product.setMadeToOrder(request.getMadeToOrder());
        }

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
        toggleProductStatus(id, false);
    }

    public ProductResponse toggleProductStatus(Long id, boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(active);
        product = productRepository.save(product);
        return mapToResponse(product);
    }

    public Page<ProductResponse> manageProducts(String search, Long categoryId, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<Product> page;

        if (normalizedSearch == null && categoryId == null) {
            page = productRepository.findAll(pageable);
        } else if (normalizedSearch == null) {
            page = productRepository.findByCategoryId(categoryId, pageable);
        } else if (categoryId == null) {
            page = productRepository.searchManageProducts(normalizedSearch, pageable);
        } else {
            page = productRepository.searchManageProductsByCategory(normalizedSearch, categoryId, pageable);
        }

        return page.map(this::mapToResponse);
    }

    // Búsqueda y filtros avanzados
    public Page<ProductResponse> searchProducts(String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        if (normalizedSearch == null) {
            return productRepository.findByActiveTrue(pageable).map(this::mapToResponse);
        }
        return productRepository.searchActiveProducts(normalizedSearch, pageable)
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
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();

        Page<Product> page;
        if (normalizedSearch == null) {
            page = productRepository.findActiveByFilters(categoryId, ivaRate, minPrice, maxPrice, pageable);
        } else {
            page = productRepository.searchActiveWithFilters(
                    normalizedSearch, categoryId, ivaRate, minPrice, maxPrice, pageable
            );
        }

        return page.map(this::mapToResponse);
    }

    public Page<ProductResponse> getProductsByCategoryPaginated(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryAndActive(categoryId, pageable)
                .map(this::mapToResponse);
    }

    public Page<ProductResponse> getProductsByIvaRate(ProductIvaRate ivaRate, Pageable pageable) {
        return productRepository.findByIvaRateAndActive(ivaRate, pageable)
                .map(this::mapToResponse);
    }

    private String resolveBarcode(String barcode) {
        if (barcode == null || barcode.isBlank()) {
            return "AUTO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        return barcode;
    }

    private Category resolveCategory(Long categoryId) {
        if (categoryId != null) {
            return categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        }
        return categoryRepository.findByNameIgnoreCase("GENERAL")
                .orElseThrow(() -> new RuntimeException("Categoría GENERAL no encontrada. Reinicie la aplicación."));
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
                .madeToOrder(product.getMadeToOrder())
                .build();
    }
}
