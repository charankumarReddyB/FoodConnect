package com.foodconnect.service;

import com.foodconnect.dto.request.*;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.RefreshTokenResponse;
import com.foodconnect.dto.response.UserResponse;

import java.util.Map;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    JwtAuthResponse login(LoginRequest request);
    JwtAuthResponse adminLogin(LoginRequest request);
    RefreshTokenResponse refreshToken(RefreshTokenRequest request);
    UserResponse getCurrentUser();
    void logout(String token);

    // Enhanced Auth Options
    JwtAuthResponse googleAuth(GoogleAuthRequest request);
    JwtAuthResponse authenticateWithFirebase(FirebaseTokenRequest request);
    Map<String, Object> sendPhoneOtp(SendOtpRequest request);
    JwtAuthResponse verifyPhoneOtp(VerifyOtpRequest request);
    Map<String, Object> forgotPassword(ForgotPasswordRequest request);
    Map<String, Object> resetPassword(ResetPasswordRequest request);
    UserResponse linkAccount(LinkAccountRequest request);
}
