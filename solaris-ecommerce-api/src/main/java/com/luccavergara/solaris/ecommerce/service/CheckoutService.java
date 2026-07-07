package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CheckoutRequest;
import com.luccavergara.solaris.ecommerce.dto.CheckoutResponse;
import com.luccavergara.solaris.ecommerce.dto.OrderItemResponse;
import com.luccavergara.solaris.ecommerce.entity.*;
import com.luccavergara.solaris.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CheckoutService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final WebClient.Builder webClientBuilder;

    @Value("${solaris.billing.url}")
    private String solarisBillingUrl;

    public CheckoutResponse processCheckout(CheckoutRequest request) {
        // Obtener el carrito
        Cart cart = cartRepository.findByCartIdentifier(request.getCartIdentifier())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Obtener el cliente
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Verificar stock de todos los productos
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
        }

        // Crear el pedido
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .user(customer.getUser())
                .status(OrderStatus.PENDING)
                .totalAmount(cart.getTotalAmount())
                .subtotal(cart.getTotalAmount())
                .taxAmount(BigDecimal.ZERO)
                .shippingAmount(BigDecimal.ZERO)
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress() != null ? request.getBillingAddress() : request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);

        // Crear los items del pedido
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .totalPrice(cartItem.getTotalPrice())
                    .productName(cartItem.getProductName())
                    .productBarcode(cartItem.getProductBarcode())
                    .build();

            orderItemRepository.save(orderItem);
            order.getItems().add(orderItem);

            // Actualizar stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Integración con solaris-billing-api
        String paymentUrl = null;
        String paymentReference = null;

        try {
            BillingRequest billingRequest = BillingRequest.builder()
                    .orderNumber(order.getOrderNumber())
                    .amount(order.getTotalAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .customerEmail(customer.getEmail())
                    .customerName(customer.getRazonSocial())
                    .build();

            BillingResponse billingResponse = webClientBuilder.build()
                    .post()
                    .uri(solarisBillingUrl + "/payments/create")
                    .bodyValue(billingRequest)
                    .retrieve()
                    .bodyToMono(BillingResponse.class)
                    .block();

            if (billingResponse != null) {
                paymentUrl = billingResponse.getPaymentUrl();
                paymentReference = billingResponse.getPaymentReference();
                order.setPaymentReference(paymentReference);
                orderRepository.save(order);
            }
        } catch (Exception e) {
            // Si falla la integración con billing, continuamos pero marcamos el error
            System.err.println("Error integrating with solaris-billing: " + e.getMessage());
        }

        // Limpiar el carrito
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setTotalItems(0);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        // Mapear la respuesta
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .createdAt(order.getCreatedAt())
                .paymentUrl(paymentUrl)
                .paymentReference(paymentReference)
                .items(itemResponses)
                .build();
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + timestamp + "-" + random;
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())
                .productBarcode(item.getProductBarcode())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }

    // DTOs para integración con billing
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class BillingRequest {
        private String orderNumber;
        private BigDecimal amount;
        private String paymentMethod;
        private String customerEmail;
        private String customerName;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class BillingResponse {
        private String paymentUrl;
        private String paymentReference;
    }
}
