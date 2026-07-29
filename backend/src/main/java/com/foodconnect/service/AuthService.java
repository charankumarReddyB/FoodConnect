package com.foodconnect.service;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RefreshTokenRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.RefreshTokenResponse;
import com.foodconnect.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    JwtAuthResponse login(LoginRequest request);
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
    UserResponse getCurrentUser();
    void logout(String token);
}
