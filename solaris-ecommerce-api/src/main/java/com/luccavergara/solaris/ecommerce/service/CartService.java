package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.*;
import com.luccavergara.solaris.ecommerce.entity.*;
import com.luccavergara.solaris.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final ProductFormRepository productFormRepository;
    private final ProductFormFieldRepository productFormFieldRepository;
    private final UserRepository userRepository;

    public CartResponse getOrCreateCart(Long userId, String cartIdentifier) {
        Cart cart = getOrCreateCartEntity(userId, cartIdentifier);
        return mapToResponse(loadCartWithItems(cart.getId()));
    }

    private Cart getOrCreateCartEntity(Long userId, String cartIdentifier) {
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
                Cart.CartBuilder cartBuilder = Cart.builder()
                        .cartIdentifier(UUID.randomUUID().toString())
                        .totalAmount(BigDecimal.ZERO)
                        .totalItems(0)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now());

                if (userId != null) {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    cartBuilder.user(user);
                }

                cart = cartRepository.save(cartBuilder.build());
            }
        }

        return cart;
    }

    public CartResponse addItemToCart(Long userId, String cartIdentifier, CartItemRequest request) {
        Cart cart = getOrCreateCartEntity(userId, cartIdentifier);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new RuntimeException("Product is not available");
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        boolean madeToOrder = Boolean.TRUE.equals(product.getMadeToOrder());

        if (madeToOrder) {
            addMadeToOrderItem(cart, product, request);
        } else {
            addStandardItem(cart, product, request);
        }

        updateCartTotals(cart);
        cartRepository.save(cart);
        return mapToResponse(loadCartWithItems(cart.getId()));
    }

    private void addStandardItem(Cart cart, Product product, CartItemRequest request) {
        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        if (existingItem != null && existingItem.getDetails().isEmpty()) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setTotalPrice(existingItem.getUnitPrice().multiply(BigDecimal.valueOf(existingItem.getQuantity())));
            cartItemRepository.save(existingItem);
            return;
        }

        CartItem cartItem = buildCartItem(cart, product, request.getQuantity());
        cartItemRepository.save(cartItem);
        cart.getItems().add(cartItem);
    }

    private void addMadeToOrderItem(Cart cart, Product product, CartItemRequest request) {
        ProductForm productForm = productFormRepository.findByProduct_Id(product.getId())
                .orElseThrow(() -> new RuntimeException("Este producto a pedido no tiene formulario configurado"));

        productForm.getFields().size();

        List<CartItemDetail> details = buildValidatedDetails(product, productForm, request.getDetails());

        CartItem cartItem = buildCartItem(cart, product, request.getQuantity());
        for (CartItemDetail detail : details) {
            detail.setCartItem(cartItem);
            cartItem.getDetails().add(detail);
        }

        cartItemRepository.save(cartItem);
        cart.getItems().add(cartItem);
    }

    private CartItem buildCartItem(Cart cart, Product product, Integer quantity) {
        return CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(quantity)
                .unitPrice(product.getPrice())
                .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                .productName(product.getName())
                .productBarcode(product.getBarcode())
                .details(new ArrayList<>())
                .build();
    }

    private List<CartItemDetail> buildValidatedDetails(
            Product product,
            ProductForm productForm,
            List<ProductOrderDetailRequest> detailRequests
    ) {
        if (detailRequests == null || detailRequests.isEmpty()) {
            throw new RuntimeException("Debes completar la personalización del producto");
        }

        List<CartItemDetail> details = new ArrayList<>();

        for (ProductFormField field : productForm.getFields()) {
            ProductOrderDetailRequest submitted = detailRequests.stream()
                    .filter(detail -> field.getFieldKey().equals(detail.getFieldKey()))
                    .findFirst()
                    .orElse(null);

            String value = submitted != null ? submitted.getFieldValue() : null;
            boolean hasValue = value != null && !value.isBlank();

            if (Boolean.TRUE.equals(field.getRequired()) && !hasValue) {
                throw new RuntimeException("El campo \"" + field.getLabel() + "\" es obligatorio");
            }

            if (!hasValue) {
                continue;
            }

            ProductFormField formFieldRef = productFormFieldRepository.findById(field.getId()).orElse(field);

            details.add(CartItemDetail.builder()
                    .product(product)
                    .productFormField(formFieldRef)
                    .fieldKey(field.getFieldKey())
                    .fieldLabel(field.getLabel())
                    .fieldValue(value.trim())
                    .build());
        }

        return details;
    }

    public CartResponse updateCartItem(Long userId, String cartIdentifier, Long itemId, Integer quantity) {
        Cart cart = getCartEntity(userId, cartIdentifier);

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to this cart");
        }

        if (!cartItem.getDetails().isEmpty()) {
            throw new RuntimeException("No se puede modificar la cantidad de un producto personalizado");
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
        cartRepository.save(cart);
        return mapToResponse(loadCartWithItems(cart.getId()));
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
        cartRepository.save(cart);
        return mapToResponse(loadCartWithItems(cart.getId()));
    }

    public CartResponse clearCart(Long userId, String cartIdentifier) {
        Cart cart = getCartEntity(userId, cartIdentifier);

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        updateCartTotals(cart);
        cartRepository.save(cart);
        return mapToResponse(loadCartWithItems(cart.getId()));
    }

    public CartResponse getCart(Long userId, String cartIdentifier) {
        Cart cart = getCartEntity(userId, cartIdentifier);
        return mapToResponse(loadCartWithItems(cart.getId()));
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

    private Cart loadCartWithItems(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.getItems().forEach(item -> item.getDetails().size());
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
        List<ProductOrderDetailResponse> details = item.getDetails() != null
                ? item.getDetails().stream().map(this::mapDetailToResponse).collect(Collectors.toList())
                : List.of();

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productBarcode(item.getProductBarcode())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .details(details)
                .build();
    }

    private ProductOrderDetailResponse mapDetailToResponse(CartItemDetail detail) {
        return ProductOrderDetailResponse.builder()
                .id(detail.getId())
                .productId(detail.getProduct() != null ? detail.getProduct().getId() : null)
                .productFormFieldId(detail.getProductFormField() != null ? detail.getProductFormField().getId() : null)
                .fieldKey(detail.getFieldKey())
                .fieldLabel(detail.getFieldLabel())
                .fieldValue(detail.getFieldValue())
                .build();
    }
}
