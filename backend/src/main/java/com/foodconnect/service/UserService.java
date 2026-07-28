package com.foodconnect.service;

import com.foodconnect.dto.request.LocationUpdateRequest;
import com.foodconnect.dto.request.UserProfileUpdateRequest;
import com.foodconnect.dto.response.UserResponse;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse updateProfile(Long userId, UserProfileUpdateRequest request);
    UserResponse updateLocation(Long userId, LocationUpdateRequest request);
    void deactivateAccount(Long userId);
}
