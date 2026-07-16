package com.luccavergara.solaris.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnopenedOrdersSummary {
    private long count;
    private OrderSummary latestOrder;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderSummary {
        private Long id;
        private String orderNumber;
        private java.math.BigDecimal totalAmount;
        private java.time.LocalDateTime createdAt;
    }
}
