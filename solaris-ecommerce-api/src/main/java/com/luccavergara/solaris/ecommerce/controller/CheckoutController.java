package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.CheckoutRequest;
import com.luccavergara.solaris.ecommerce.dto.CheckoutResponse;
import com.luccavergara.solaris.ecommerce.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping
    public ResponseEntity<CheckoutResponse> processCheckout(@Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(checkoutService.processCheckout(request));
    }
}
