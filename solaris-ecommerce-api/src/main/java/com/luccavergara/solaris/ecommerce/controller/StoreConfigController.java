package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.StoreConfigRequest;
import com.luccavergara.solaris.ecommerce.dto.StoreConfigResponse;
import com.luccavergara.solaris.ecommerce.service.StoreConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/store-config")
@RequiredArgsConstructor
public class StoreConfigController {

    private final StoreConfigService storeConfigService;

    @GetMapping("/key/{key}")
    public ResponseEntity<StoreConfigResponse> getConfigByKey(@PathVariable String key) {
        return ResponseEntity.ok(storeConfigService.getConfigByKey(key));
    }

    @GetMapping
    public ResponseEntity<List<StoreConfigResponse>> getAllConfigs() {
        return ResponseEntity.ok(storeConfigService.getAllConfigs());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<StoreConfigResponse>> getConfigsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(storeConfigService.getConfigsByCategory(category));
    }

    @GetMapping("/map")
    public ResponseEntity<Map<String, String>> getConfigsAsMap() {
        return ResponseEntity.ok(storeConfigService.getConfigsAsMap());
    }

    @PostMapping
    public ResponseEntity<StoreConfigResponse> createConfig(@Valid @RequestBody StoreConfigRequest request) {
        return ResponseEntity.ok(storeConfigService.createConfig(request));
    }

    @PutMapping("/key/{key}")
    public ResponseEntity<StoreConfigResponse> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody StoreConfigRequest request
    ) {
        return ResponseEntity.ok(storeConfigService.updateConfig(key, request));
    }

    @DeleteMapping("/key/{key}")
    public ResponseEntity<Void> deleteConfig(@PathVariable String key) {
        storeConfigService.deleteConfig(key);
        return ResponseEntity.noContent().build();
    }
}
