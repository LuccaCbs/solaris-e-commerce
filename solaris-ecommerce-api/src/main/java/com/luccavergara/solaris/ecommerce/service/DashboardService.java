package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.entity.Order;
import com.luccavergara.solaris.ecommerce.entity.OrderStatus;
import com.luccavergara.solaris.ecommerce.repository.OrderRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import com.luccavergara.solaris.ecommerce.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total de productos
        long totalProducts = productRepository.count();
        stats.put("totalProducts", totalProducts);

        // Productos con bajo stock
        long lowStockProducts = productRepository.countByStockQuantityLessThanLowStockThreshold();
        stats.put("lowStockProducts", lowStockProducts);

        // Total de clientes
        long totalCustomers = customerRepository.count();
        stats.put("totalCustomers", totalCustomers);

        // Total de pedidos
        long totalOrders = orderRepository.count();
        stats.put("totalOrders", totalOrders);

        // Pedidos por estado
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.countByStatus(status);
            ordersByStatus.put(status.name(), count);
        }
        stats.put("ordersByStatus", ordersByStatus);

        // Ingresos del mes actual
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        BigDecimal monthlyRevenue = orderRepository.sumTotalAmountByCreatedAtBetween(monthStart, monthEnd);
        stats.put("monthlyRevenue", monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO);

        // Ingresos del día actual
        LocalDateTime dayStart = LocalDate.now().atStartOfDay();
        LocalDateTime dayEnd = LocalDate.now().atTime(23, 59, 59);
        
        BigDecimal dailyRevenue = orderRepository.sumTotalAmountByCreatedAtBetween(dayStart, dayEnd);
        stats.put("dailyRevenue", dailyRevenue != null ? dailyRevenue : BigDecimal.ZERO);

        // Pedidos del mes actual
        long monthlyOrders = orderRepository.countByCreatedAtBetween(monthStart, monthEnd);
        stats.put("monthlyOrders", monthlyOrders);

        // Pedidos del día actual
        long dailyOrders = orderRepository.countByCreatedAtBetween(dayStart, dayEnd);
        stats.put("dailyOrders", dailyOrders);

        long unopenedOrders = orderRepository.countByViewedByAdminFalse();
        stats.put("unopenedOrders", unopenedOrders);

        List<Map<String, Object>> recentUnopenedOrders = orderRepository
                .findTop5ByViewedByAdminFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapOrderSummary)
                .toList();

        stats.put("recentUnopenedOrders", recentUnopenedOrders);

        return stats;
    }

    private Map<String, Object> mapOrderSummary(Order order) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", order.getId());
        summary.put("orderNumber", order.getOrderNumber());
        summary.put("totalAmount", order.getTotalAmount());
        summary.put("createdAt", order.getCreatedAt());
        summary.put("viewedByAdmin", order.getViewedByAdmin());
        if (order.getUser() != null) {
            summary.put("userName", order.getUser().getFirstname() + " " + order.getUser().getLastname());
            summary.put("userEmail", order.getUser().getEmail());
        }
        return summary;
    }
}
