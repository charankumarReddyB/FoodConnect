package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.request.LocationUpdateRequest;
import com.foodconnect.dto.request.UserProfileUpdateRequest;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile and location management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update logged-in user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody UserProfileUpdateRequest updateRequest) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        UserResponse response = userService.updateProfile(authenticatedUserId, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/location")
    @Operation(summary = "Update user current geolocation coordinates")
    public ResponseEntity<ApiResponse<UserResponse>> updateLocation(@RequestBody LocationUpdateRequest locationRequest) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        UserResponse response = userService.updateLocation(authenticatedUserId, locationRequest);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", response));
    }
}
