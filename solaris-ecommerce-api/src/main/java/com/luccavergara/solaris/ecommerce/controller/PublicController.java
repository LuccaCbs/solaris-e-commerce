package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.FeaturedProductResponse;
import com.luccavergara.solaris.ecommerce.service.FeaturedProductService;
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

    private final FeaturedProductService featuredProductService;

    @GetMapping("/featured-products")
    public ResponseEntity<List<FeaturedProductResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(featuredProductService.getActiveForStorefront());
    }
}
