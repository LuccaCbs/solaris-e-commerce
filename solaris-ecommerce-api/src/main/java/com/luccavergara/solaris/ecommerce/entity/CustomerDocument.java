package com.luccavergara.solaris.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType documentType;

    @Column(nullable = false, length = 20)
    private String documentNumber;

    @Column(nullable = false)
    @Builder.Default
    private Boolean primary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
}
