package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.FeaturedCategoryResponse;
import com.luccavergara.solaris.ecommerce.dto.FeaturedProductResponse;
import com.luccavergara.solaris.ecommerce.dto.PublicStorefrontResponse;
import com.luccavergara.solaris.ecommerce.service.FeaturedCategoryService;
import com.luccavergara.solaris.ecommerce.service.FeaturedProductService;
import com.luccavergara.solaris.ecommerce.service.StoreConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class PublicController {

    private final FeaturedCategoryService featuredCategoryService;
    private final FeaturedProductService featuredProductService;
    private final StoreConfigService storeConfigService;

    @GetMapping("/storefront")
    public ResponseEntity<PublicStorefrontResponse> getStorefront() {
        String displayMode = storeConfigService.getConfigValueOrDefault("featured.display_mode", "INDIVIDUAL");
        List<FeaturedProductResponse> products = featuredProductService.getActiveForStorefront();

        return ResponseEntity.ok(PublicStorefrontResponse.builder()
                .displayMode(displayMode)
                .products(products)
                .build());
    }

    @GetMapping("/featured-products")
    public ResponseEntity<List<FeaturedProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(featuredProductService.getActiveForStorefront());
    }

    @GetMapping("/featured-categories")
    public ResponseEntity<List<FeaturedCategoryResponse>> getFeaturedCategories() {
        return ResponseEntity.ok(featuredCategoryService.getActiveForStorefront());
    }
}
