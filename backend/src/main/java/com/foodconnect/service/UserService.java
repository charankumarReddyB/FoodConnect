package com.foodconnect.service;

import com.foodconnect.dto.request.LocationUpdateRequest;
import com.foodconnect.dto.request.UserProfileUpdateRequest;
import com.foodconnect.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse getUserById(UUID id);
    UserResponse updateProfile(UUID userId, UserProfileUpdateRequest request);
    UserResponse updateLocation(UUID userId, LocationUpdateRequest request);
    void toggleUserStatus(UUID userId, Boolean active);
    void deactivateAccount(UUID userId);
}
