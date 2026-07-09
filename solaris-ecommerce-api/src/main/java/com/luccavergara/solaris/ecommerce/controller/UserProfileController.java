package com.luccavergara.solaris.ecommerce.controller;

import com.luccavergara.solaris.ecommerce.dto.ChangePasswordRequest;
import com.luccavergara.solaris.ecommerce.dto.UserProfileRequest;
import com.luccavergara.solaris.ecommerce.dto.UserProfileResponse;
import com.luccavergara.solaris.ecommerce.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userProfileService.getUserProfile(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UserProfileRequest request
    ) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(userId, request));
    }

    @PostMapping("/{userId}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userProfileService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
