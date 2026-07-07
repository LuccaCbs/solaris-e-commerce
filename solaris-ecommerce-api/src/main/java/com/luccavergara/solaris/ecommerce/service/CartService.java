package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CartItemRequest;
import com.luccavergara.solaris.ecommerce.dto.CartItemResponse;
import com.luccavergara.solaris.ecommerce.dto.CartResponse;
import com.luccavergara.solaris.ecommerce.entity.Cart;
import com.luccavergara.solaris.ecommerce.entity.CartItem;
import com.luccavergara.solaris.ecommerce.entity.Product;
import com.luccavergara.solaris.ecommerce.entity.User;
import com.luccavergara.solaris.ecommerce.repository.CartItemRepository;
import com.luccavergara.solaris.ecommerce.repository.CartRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
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
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartResponse getOrCreateCart(Long userId, String cartIdentifier) {
        Cart cart;

        if (cartIdentifier != null) {
            cart = cartRepository.findByCartIdentifier(cartIdentifier)
                    .orElse(null);
        } else {
            cart = null;
        }

        if (cart == null) {
            if (userId != null) {
                cart = cartRepository.findByUserId(userId).orElse(null);
            }

            if (cart == null) {
                cart = Cart.builder()
                        .cartIdentifier(UUID.randomUUID().toString())
                        .totalAmount(BigDecimal.ZERO)
                        .totalItems(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                cart = cartRepository.save(cart);
            }
        }

        return mapToResponse(cart);
    }

    public CartResponse addItemToCart(Long userId, String cartIdentifier, CartItemRequest request) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getActive()) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setTotalPrice(existingItem.getUnitPrice().multiply(BigDecimal.valueOf(existingItem.getQuantity())));
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())))
                    .productName(product.getName())
                    .productBarcode(product.getBarcode())
                    .build();
            cartItemRepository.save(cartItem);
            cart.getItems().add(cartItem);
        }

        updateCartTotals(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse updateCartItem(Long userId, String cartIdentifier, Long itemId, Integer quantity) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            cart.getItems().removeIf(item -> item.getId().equals(itemId));
        } else {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }
            cartItem.setQuantity(quantity);
            cartItem.setTotalPrice(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(quantity)));
            cartItemRepository.save(cartItem);
        }

        updateCartTotals(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse removeCartItem(Long userId, String cartIdentifier, Long itemId) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }

        cartItemRepository.delete(cartItem);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));

        updateCartTotals(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse clearCart(Long userId, String cartIdentifier) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        updateCartTotals(cart);
        cart = cartRepository.save(cart);
        return mapToResponse(cart);
    }

    public CartResponse getCart(Long userId, String cartIdentifier) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        return mapToResponse(cart);
    }

    private Cart getCartEntity(Long userId, String cartIdentifier) {
        Cart cart;

        if (cartIdentifier != null) {
            cart = cartRepository.findByCartIdentifier(cartIdentifier)
                    .orElseThrow(() -> new RuntimeException("Cart not found"));
        } else if (userId != null) {
            cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Cart not found"));
        } else {
            throw new RuntimeException("Either userId or cartIdentifier must be provided");
        }

        return cart;
    }

    private void updateCartTotals(Cart cart) {
        BigDecimal totalAmount = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        cart.setTotalAmount(totalAmount);
        cart.setTotalItems(totalItems);
        cart.setUpdatedAt(LocalDateTime.now());
    }

    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());

        return CartResponse.builder()
                .id(cart.getId())
                .cartIdentifier(cart.getCartIdentifier())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .totalAmount(cart.getTotalAmount())
                .totalItems(cart.getTotalItems())
                .items(items)
                .build();
    }

    private CartItemResponse mapItemToResponse(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productBarcode(item.getProductBarcode())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
