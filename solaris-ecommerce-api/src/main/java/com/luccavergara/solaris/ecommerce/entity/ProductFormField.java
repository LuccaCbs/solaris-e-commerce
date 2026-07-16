package com.luccavergara.solaris.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "product_form_fields",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_product_form_fields_key",
                columnNames = {"product_form_id", "field_key"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_form_id", nullable = false)
    private ProductForm productForm;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false, length = 50)
    private FormFieldType fieldType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean required = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(length = 255)
    private String placeholder;
}
