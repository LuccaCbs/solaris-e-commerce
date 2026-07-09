package com.luccavergara.solaris.ecommerce.service;

import com.luccavergara.solaris.ecommerce.dto.StoreConfigRequest;
import com.luccavergara.solaris.ecommerce.dto.StoreConfigResponse;
import com.luccavergara.solaris.ecommerce.entity.StoreConfig;
import com.luccavergara.solaris.ecommerce.repository.StoreConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StoreConfigService {

    private final StoreConfigRepository storeConfigRepository;

    public StoreConfigResponse getConfigByKey(String key) {
        StoreConfig config = storeConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Config not found"));
        return mapToResponse(config);
    }

    public List<StoreConfigResponse> getAllConfigs() {
        return storeConfigRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<StoreConfigResponse> getConfigsByCategory(String category) {
        return storeConfigRepository.findByCategory(category).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StoreConfigResponse createConfig(StoreConfigRequest request) {
        if (storeConfigRepository.findByConfigKey(request.getConfigKey()).isPresent()) {
            throw new RuntimeException("Config key already exists");
        }

        StoreConfig config = StoreConfig.builder()
                .configKey(request.getConfigKey())
                .configValue(request.getConfigValue())
                .description(request.getDescription())
                .category(request.getCategory())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        config = storeConfigRepository.save(config);
        return mapToResponse(config);
    }

    public StoreConfigResponse updateConfig(String key, StoreConfigRequest request) {
        StoreConfig config = storeConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Config not found"));

        config.setConfigValue(request.getConfigValue());
        if (request.getDescription() != null) {
            config.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            config.setCategory(request.getCategory());
        }
        if (request.getActive() != null) {
            config.setActive(request.getActive());
        }

        config = storeConfigRepository.save(config);
        return mapToResponse(config);
    }

    public void deleteConfig(String key) {
        StoreConfig config = storeConfigRepository.findByConfigKey(key)
                .orElseThrow(() -> new RuntimeException("Config not found"));
        storeConfigRepository.delete(config);
    }

    public Map<String, String> getConfigsAsMap() {
        return storeConfigRepository.findByActiveTrue().stream()
                .collect(Collectors.toMap(
                        StoreConfig::getConfigKey,
                        StoreConfig::getConfigValue
                ));
    }

    public String getConfigValueOrDefault(String key, String defaultValue) {
        return storeConfigRepository.findByConfigKey(key)
                .map(StoreConfig::getConfigValue)
                .orElse(defaultValue);
    }

    private StoreConfigResponse mapToResponse(StoreConfig config) {
        return StoreConfigResponse.builder()
                .id(config.getId())
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .description(config.getDescription())
                .category(config.getCategory())
                .active(config.getActive())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}
