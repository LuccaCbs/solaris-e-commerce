package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.CartItemRequest;
import com.luccavergara.solaris.ecommerce.dto.CartResponse;
import com.luccavergara.solaris.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "cartIdentifier", required = false) String cartIdentifier
    ) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userId, cartIdentifier));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "cartIdentifier", required = false) String cartIdentifier,
            @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItemToCart(userId, cartIdentifier, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "cartIdentifier", required = false) String cartIdentifier,
            @PathVariable Long itemId,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, cartIdentifier, itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeCartItem(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "cartIdentifier", required = false) String cartIdentifier,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(cartService.removeCartItem(userId, cartIdentifier, itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<CartResponse> clearCart(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestParam(value = "cartIdentifier", required = false) String cartIdentifier
    ) {
        return ResponseEntity.ok(cartService.clearCart(userId, cartIdentifier));
    }
}
