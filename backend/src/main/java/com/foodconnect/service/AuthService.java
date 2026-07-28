package com.foodconnect.service;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    JwtAuthResponse login(LoginRequest request);
    UserResponse getCurrentUser();
    void logout(String token);
}
