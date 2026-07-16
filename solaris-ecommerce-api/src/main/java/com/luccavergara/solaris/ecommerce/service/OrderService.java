package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.*;
import com.luccavergara.solaris.ecommerce.entity.*;
import com.luccavergara.solaris.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductFormRepository productFormRepository;
    private final ProductFormFieldRepository productFormFieldRepository;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
        }

        if (user == null && customer != null) {
            user = customer.getUser();
        }

        if (user == null) {
            throw new RuntimeException("Order must have a valid user");
        }

        LocalDateTime now = LocalDateTime.now();
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .customer(customer)
                .user(user)
                .status(OrderStatus.PENDING)
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .taxAmount(request.getTaxAmount())
                .shippingAmount(request.getShippingAmount())
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentReference(request.getPaymentReference())
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            if (!Boolean.TRUE.equals(product.getActive())) {
                throw new RuntimeException("Product is not active: " + product.getName());
            }

            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(lineTotal)
                    .productName(product.getName())
                    .productBarcode(product.getBarcode())
                    .details(new ArrayList<>())
                    .build();

            if (Boolean.TRUE.equals(product.getMadeToOrder())) {
                validateAndAttachDetails(order, orderItem, product, itemRequest.getDetails());
            }

            order.getItems().add(orderItem);
            subtotal = subtotal.add(lineTotal);

            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        BigDecimal taxAmount = request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal shippingAmount = request.getShippingAmount() != null ? request.getShippingAmount() : BigDecimal.ZERO;
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(taxAmount).add(shippingAmount));

        order = orderRepository.save(order);
        return mapToResponse(order);
    }

    private void validateAndAttachDetails(
            Order order,
            OrderItem orderItem,
            Product product,
            List<ProductOrderDetailRequest> detailRequests
    ) {
        ProductForm productForm = productFormRepository.findByProduct_Id(product.getId())
                .orElseThrow(() -> new RuntimeException("Made-to-order product requires a configured form: " + product.getName()));

        if (detailRequests == null || detailRequests.isEmpty()) {
            throw new RuntimeException("Made-to-order product requires customization details: " + product.getName());
        }

        for (ProductOrderDetailRequest detailRequest : detailRequests) {
            ProductFormField formField = null;
            if (detailRequest.getProductFormFieldId() != null) {
                formField = productFormFieldRepository.findById(detailRequest.getProductFormFieldId())
                        .orElse(null);
            }

            ProductOrderDetail detail = ProductOrderDetail.builder()
                    .order(order)
                    .orderItem(orderItem)
                    .product(product)
                    .productFormField(formField)
                    .fieldKey(detailRequest.getFieldKey())
                    .fieldLabel(detailRequest.getFieldLabel())
                    .fieldValue(detailRequest.getFieldValue())
                    .build();

            orderItem.getDetails().add(detail);
        }
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        initializeOrderDetails(order);
        return mapToResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        initializeOrderDetails(order);
        return mapToResponse(order);
    }

    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersByCustomerIdPaginated(Long customerId, Pageable pageable) {
        return orderRepository.findByCustomerId(customerId, pageable)
                .map(this::mapToResponse);
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersByUserIdPaginated(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getOrdersByStatusPaginated(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable)
                .map(this::mapToResponse);
    }

    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(order -> {
            initializeOrderDetails(order);
            return mapToResponse(order);
        });
    }

    public UnopenedOrdersSummary getUnopenedOrdersSummary() {
        long count = orderRepository.countByViewedByAdminFalse();
        UnopenedOrdersSummary.UnopenedOrdersSummaryBuilder builder = UnopenedOrdersSummary.builder()
                .count(count);

        orderRepository.findFirstByViewedByAdminFalseOrderByCreatedAtDesc()
                .ifPresent(order -> builder.latestOrder(UnopenedOrdersSummary.OrderSummary.builder()
                        .id(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .totalAmount(order.getTotalAmount())
                        .createdAt(order.getCreatedAt())
                        .build()));

        return builder.build();
    }

    @Transactional
    public OrderResponse markOrderAsViewed(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!Boolean.TRUE.equals(order.getViewedByAdmin())) {
            order.setViewedByAdmin(true);
            order.setUpdatedAt(LocalDateTime.now());
            order = orderRepository.save(order);
        }

        initializeOrderDetails(order);
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        order.setUpdatedAt(LocalDateTime.now());

        order = orderRepository.save(order);
        initializeOrderDetails(order);
        return mapToResponse(order);
    }

    private void initializeOrderDetails(Order order) {
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                if (item.getDetails() != null) {
                    item.getDetails().size();
                }
            });
        }
    }

    private String buildUserName(User user) {
        if (user == null) {
            return null;
        }
        String name = ((user.getFirstname() != null ? user.getFirstname() : "") + " "
                + (user.getLastname() != null ? user.getLastname() : "")).trim();
        return name.isEmpty() ? user.getEmail() : name;
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapOrderItemToResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer() != null ? order.getCustomer().getId() : null)
                .customerName(order.getCustomer() != null ? order.getCustomer().getRazonSocial() : null)
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(buildUserName(order.getUser()))
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .subtotal(order.getSubtotal())
                .taxAmount(order.getTaxAmount())
                .shippingAmount(order.getShippingAmount())
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentReference(order.getPaymentReference())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .viewedByAdmin(order.getViewedByAdmin())
                .items(items)
                .build();
    }

    private OrderItemResponse mapOrderItemToResponse(OrderItem item) {
        List<ProductOrderDetailResponse> details = item.getDetails() != null
                ? item.getDetails().stream().map(this::mapDetailToResponse).collect(Collectors.toList())
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

    private ProductOrderDetailResponse mapDetailToResponse(ProductOrderDetail detail) {
        return ProductOrderDetailResponse.builder()
                .id(detail.getId())
                .orderId(detail.getOrder() != null ? detail.getOrder().getId() : null)
                .orderItemId(detail.getOrderItem() != null ? detail.getOrderItem().getId() : null)
                .productId(detail.getProduct() != null ? detail.getProduct().getId() : null)
                .productFormFieldId(detail.getProductFormField() != null ? detail.getProductFormField().getId() : null)
                .fieldKey(detail.getFieldKey())
                .fieldLabel(detail.getFieldLabel())
                .fieldValue(detail.getFieldValue())
                .build();
    }
}
