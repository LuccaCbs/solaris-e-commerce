package com.luccavergara.solaris.ecommerce.repository;

import com.luccavergara.solaris.ecommerce.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCuit(String cuit);
    List<Customer> findByActiveTrue();

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.razonSocial) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.cuit) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Customer> searchByTerm(@Param("searchTerm") String searchTerm);
}
