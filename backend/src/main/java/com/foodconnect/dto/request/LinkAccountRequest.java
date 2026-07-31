package com.foodconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkAccountRequest {

    @NotBlank(message = "Provider type is required (GOOGLE, PHONE, EMAIL)")
    private String provider; // "GOOGLE", "PHONE", "EMAIL"

    private String googleId;
    private String phone;
    private String otpCode;
    private String email;
    private String password;
}
