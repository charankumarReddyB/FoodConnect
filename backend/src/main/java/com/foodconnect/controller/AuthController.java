package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.request.*;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.RefreshTokenResponse;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, Google Sign-In, Phone OTP, and profile retrieval")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user (Donor, NGO, Orphanage, Shelter, Volunteer, Admin)")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        UserResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User Email/Password Login and JWT Generation")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate or register user with Google OAuth ID Token/Profile")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> googleAuth(@Valid @RequestBody GoogleAuthRequest googleRequest) {
        JwtAuthResponse response = authService.googleAuth(googleRequest);
        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", response));
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send OTP to mobile number with rate limiting and cooldown enforcement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendPhoneOtp(@Valid @RequestBody SendOtpRequest otpRequest) {
        Map<String, Object> response = authService.sendPhoneOtp(otpRequest);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP code and authenticate or register user")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> verifyPhoneOtp(@Valid @RequestBody VerifyOtpRequest verifyRequest) {
        JwtAuthResponse response = authService.verifyPhoneOtp(verifyRequest);
        return ResponseEntity.ok(ApiResponse.success("Phone OTP verification successful", response));
    }

    @PostMapping("/forgot-password/request")
    @Operation(summary = "Request password reset code for email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Map<String, Object> response = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset request processed", response));
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Reset user password with verification token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Map<String, Object> response = authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", response));
    }

    @PostMapping("/link-account")
    @Operation(summary = "Link additional authentication method (Google, Phone, Email) to logged in account")
    public ResponseEntity<ApiResponse<UserResponse>> linkAccount(@Valid @RequestBody LinkAccountRequest request) {
        UserResponse response = authService.linkAccount(request);
        return ResponseEntity.ok(ApiResponse.success("Account linked successfully", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh expired JWT access token using refresh token")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse profile = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("User profile fetched successfully", profile));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}
