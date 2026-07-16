package com.luccavergara.solaris.ecommerce.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.luccavergara.solaris.ecommerce.dto.*;
import com.luccavergara.solaris.ecommerce.entity.*;
import com.luccavergara.solaris.ecommerce.repository.ProductFormRepository;
import com.luccavergara.solaris.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductFormService {

    private final ProductFormRepository productFormRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ProductFormResponse> getAllForms() {
        return productFormRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductFormResponse getFormById(Long id) {
        ProductForm form = productFormRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product form not found"));
        return mapToResponse(form);
    }

    @Transactional(readOnly = true)
    public ProductFormResponse getFormByProductId(Long productId) {
        ProductForm form = productFormRepository.findByProduct_Id(productId)
                .orElseThrow(() -> new RuntimeException("Product form not found"));
        return mapToResponse(form);
    }

    public ProductFormResponse createForm(ProductFormRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (productFormRepository.findByProduct_Id(product.getId()).isPresent()) {
            throw new RuntimeException("This product already has a form configured");
        }

        LocalDateTime now = LocalDateTime.now();
        ProductForm form = ProductForm.builder()
                .product(product)
                .active(request.getActive() != null ? request.getActive() : true)
                .createdAt(now)
                .updatedAt(now)
                .fields(new ArrayList<>())
                .build();

        applyFields(form, request.getFields());
        form = productFormRepository.save(form);
        return mapToResponse(form);
    }

    public ProductFormResponse updateForm(Long id, ProductFormRequest request) {
        ProductForm form = productFormRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product form not found"));

        if (!form.getProduct().getId().equals(request.getProductId())) {
            throw new RuntimeException("Product id cannot be changed");
        }

        if (request.getActive() != null) {
            form.setActive(request.getActive());
        }

        form.getFields().clear();
        applyFields(form, request.getFields());
        form.setUpdatedAt(LocalDateTime.now());

        form = productFormRepository.save(form);
        return mapToResponse(form);
    }

    public void deleteForm(Long id) {
        ProductForm form = productFormRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product form not found"));
        productFormRepository.delete(form);
    }

    private void applyFields(ProductForm form, List<ProductFormFieldRequest> fieldRequests) {
        int order = 0;
        for (ProductFormFieldRequest fieldRequest : fieldRequests) {
            String fieldKey = normalizeFieldKey(fieldRequest.getFieldKey());
            ProductFormField field = ProductFormField.builder()
                    .productForm(form)
                    .fieldKey(fieldKey)
                    .label(fieldRequest.getLabel().trim())
                    .fieldType(fieldRequest.getFieldType())
                    .required(fieldRequest.getRequired() != null ? fieldRequest.getRequired() : false)
                    .displayOrder(fieldRequest.getDisplayOrder() != null ? fieldRequest.getDisplayOrder() : order)
                    .options(serializeOptions(fieldRequest.getOptions()))
                    .placeholder(fieldRequest.getPlaceholder())
                    .build();
            form.getFields().add(field);
            order++;
        }
    }

    private String normalizeFieldKey(String fieldKey) {
        if (fieldKey == null || fieldKey.isBlank()) {
            throw new RuntimeException("Field key is required");
        }
        return fieldKey.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", "_")
                .replaceAll("[^a-z0-9_]", "");
    }

    private String serializeOptions(List<String> options) {
        if (options == null || options.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(options);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid field options");
        }
    }

    private List<String> deserializeOptions(String options) {
        if (options == null || options.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(options, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    private ProductFormResponse mapToResponse(ProductForm form) {
        List<ProductFormFieldResponse> fields = form.getFields().stream()
                .map(field -> ProductFormFieldResponse.builder()
                        .id(field.getId())
                        .fieldKey(field.getFieldKey())
                        .label(field.getLabel())
                        .fieldType(field.getFieldType())
                        .required(field.getRequired())
                        .displayOrder(field.getDisplayOrder())
                        .options(deserializeOptions(field.getOptions()))
                        .placeholder(field.getPlaceholder())
                        .build())
                .collect(Collectors.toList());

        return ProductFormResponse.builder()
                .id(form.getId())
                .productId(form.getProduct().getId())
                .productName(form.getProduct().getName())
                .productMadeToOrder(form.getProduct().getMadeToOrder())
                .active(form.getActive())
                .fields(fields)
                .createdAt(form.getCreatedAt())
                .updatedAt(form.getUpdatedAt())
                .build();
    }
}
