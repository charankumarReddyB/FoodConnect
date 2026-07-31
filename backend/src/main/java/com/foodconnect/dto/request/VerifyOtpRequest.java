package com.foodconnect.dto.request;

import com.foodconnect.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+[1-9]\\d{7,14}$", message = "Phone number must be in E.164 format with country code (e.g. +919876543210)")
    private String phone;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^\\d{6}$", message = "OTP must be a 6-digit number")
    private String otpCode;

    private String fullName;
    private String email;
    private UserRole role; // DONOR, VOLUNTEER, NGO, etc.
}
