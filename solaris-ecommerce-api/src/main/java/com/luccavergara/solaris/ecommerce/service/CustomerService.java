package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.CustomerRequest;
import com.luccavergara.solaris.ecommerce.dto.CustomerResponse;
import com.luccavergara.solaris.ecommerce.entity.Customer;
import com.luccavergara.solaris.ecommerce.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return mapToResponse(customer);
    }

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Page<CustomerResponse> getAllCustomersPaginated(Pageable pageable) {
        return customerRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    public List<CustomerResponse> searchCustomers(String searchTerm) {
        return customerRepository.searchByTerm(searchTerm).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .razonSocial(request.getRazonSocial())
                .cuit(request.getCuit())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .province(request.getProvince())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .taxCondition(request.getTaxCondition())
                .active(true)
                .build();

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setRazonSocial(request.getRazonSocial());
        customer.setCuit(request.getCuit());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setProvince(request.getProvince());
        customer.setPostalCode(request.getPostalCode());
        customer.setCountry(request.getCountry());
        customer.setTaxCondition(request.getTaxCondition());

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Soft delete
        customer.setActive(false);
        customerRepository.save(customer);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .razonSocial(customer.getRazonSocial())
                .cuit(customer.getCuit())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .province(customer.getProvince())
                .postalCode(customer.getPostalCode())
                .country(customer.getCountry())
                .taxCondition(customer.getTaxCondition())
                .active(customer.getActive())
                .userId(customer.getUser() != null ? customer.getUser().getId() : null)
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
