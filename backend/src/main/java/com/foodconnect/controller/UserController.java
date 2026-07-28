package com.foodconnect.controller;

import com.foodconnect.dto.auth.UserProfileResponse;
import com.foodconnect.dto.auth.UserUpdateRequest;
import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and location management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long id) {
        UserProfileResponse response = userService.getUserProfile(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update logged-in user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UserUpdateRequest updateRequest) {
        UserProfileResponse response = userService.updateUserProfile(currentUser.getId(), updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/location")
    @Operation(summary = "Update user current geolocation coordinates")
    public ResponseEntity<ApiResponse<Void>> updateLocation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        userService.updateUserLocation(currentUser.getId(), latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully"));
    }
}
