package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CheckoutResponse;
import com.luccavergara.solaris.ecommerce.dto.OrderItemResponse;
import com.luccavergara.solaris.ecommerce.dto.ProductOrderDetailResponse;
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
public class CartCheckoutService {

    private static final String GUEST_EMAIL = "guest@local.dev";

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CheckoutResponse checkoutFromCart(Long userId, String cartIdentifier) {
        Cart cart = loadCartWithItems(resolveCart(userId, cartIdentifier));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        User user = resolveUser(userId);
        LocalDateTime now = LocalDateTime.now();

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(null)
                .user(user)
                .status(OrderStatus.PENDING)
                .subtotal(cart.getTotalAmount())
                .totalAmount(cart.getTotalAmount())
                .taxAmount(BigDecimal.ZERO)
                .shippingAmount(BigDecimal.ZERO)
                .paymentMethod("MOCK")
                .notes("Pedido mock generado desde el carrito")
                .createdAt(now)
                .updatedAt(now)
                .items(new ArrayList<>())
                .build();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + product.getName());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .totalPrice(cartItem.getTotalPrice())
                    .productName(cartItem.getProductName())
                    .productBarcode(cartItem.getProductBarcode())
                    .details(new ArrayList<>())
                    .build();

            for (CartItemDetail cartDetail : cartItem.getDetails()) {
                ProductOrderDetail orderDetail = ProductOrderDetail.builder()
                        .order(order)
                        .orderItem(orderItem)
                        .product(product)
                        .productFormField(cartDetail.getProductFormField())
                        .fieldKey(cartDetail.getFieldKey())
                        .fieldLabel(cartDetail.getFieldLabel())
                        .fieldValue(cartDetail.getFieldValue())
                        .build();
                orderItem.getDetails().add(orderDetail);
            }

            order.getItems().add(orderItem);
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order = orderRepository.save(order);

        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cart.setUpdatedAt(now);
        cartRepository.save(cart);

        return mapToCheckoutResponse(order);
    }

    private User resolveUser(Long userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        }

        return userRepository.findByEmail(GUEST_EMAIL)
                .orElseThrow(() -> new RuntimeException("Usuario invitado no configurado"));
    }

    private Cart resolveCart(Long userId, String cartIdentifier) {
        if (cartIdentifier != null && !cartIdentifier.isBlank()) {
            return cartRepository.findByCartIdentifier(cartIdentifier)
                    .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        }

        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        }

        throw new RuntimeException("Carrito no encontrado");
    }

    private Cart loadCartWithItems(Cart cart) {
        Cart loaded = cartRepository.findById(cart.getId())
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        loaded.getItems().forEach(item -> item.getDetails().size());
        return loaded;
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private CheckoutResponse mapToCheckoutResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .paymentReference("MOCK-" + order.getOrderNumber())
                .items(items)
                .build();
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
        List<ProductOrderDetailResponse> details = item.getDetails() != null
                ? item.getDetails().stream().map(detail -> ProductOrderDetailResponse.builder()
                        .id(detail.getId())
                        .orderId(detail.getOrder() != null ? detail.getOrder().getId() : null)
                        .orderItemId(detail.getOrderItem() != null ? detail.getOrderItem().getId() : null)
                        .productId(detail.getProduct() != null ? detail.getProduct().getId() : null)
                        .productFormFieldId(detail.getProductFormField() != null ? detail.getProductFormField().getId() : null)
                        .fieldKey(detail.getFieldKey())
                        .fieldLabel(detail.getFieldLabel())
                        .fieldValue(detail.getFieldValue())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return OrderItemResponse.builder()
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
}
