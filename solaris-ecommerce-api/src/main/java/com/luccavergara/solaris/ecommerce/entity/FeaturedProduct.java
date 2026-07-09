package com.luccavergara.solaris.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "featured_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeaturedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    @Builder.Default
    private CardType cardType = CardType.BASIC;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
