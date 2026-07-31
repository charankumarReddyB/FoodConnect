package com.foodconnect.dto.request;

import com.foodconnect.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Google ID or Token is required")
    private String googleId;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String fullName;
    private String profileImageUrl;

    private UserRole role; // Optional, default DONOR if new user
}
