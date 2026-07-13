package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.Product;
import com.luccavergara.solaris.ecommerce.entity.ProductIvaRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    List<Product> findByActiveTrue();

    Page<Product> findByActiveTrue(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQuantity < p.lowStockThreshold")
    long countByStockQuantityLessThanLowStockThreshold();

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> searchActiveProducts(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.category.id = :categoryId")
    Page<Product> findByCategoryAndActive(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.ivaRate = :ivaRate")
    Page<Product> findByIvaRateAndActive(@Param("ivaRate") ProductIvaRate ivaRate, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "p.category.id = :categoryId AND p.ivaRate = :ivaRate")
    Page<Product> findByCategoryAndIvaRateAndActive(
            @Param("categoryId") Long categoryId,
            @Param("ivaRate") ProductIvaRate ivaRate,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findActiveByPriceRange(
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:ivaRate IS NULL OR p.ivaRate = :ivaRate) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findActiveByFilters(
            @Param("categoryId") Long categoryId,
            @Param("ivaRate") ProductIvaRate ivaRate,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:ivaRate IS NULL OR p.ivaRate = :ivaRate) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchActiveWithFilters(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            @Param("ivaRate") ProductIvaRate ivaRate,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> searchManageProducts(@Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "(p.description IS NOT NULL AND LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))))")
    Page<Product> searchManageProductsByCategory(
            @Param("search") String search,
            @Param("categoryId") Long categoryId,
            Pageable pageable);
}
