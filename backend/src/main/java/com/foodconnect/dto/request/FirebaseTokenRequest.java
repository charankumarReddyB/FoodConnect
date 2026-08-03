package com.foodconnect.dto.request;

import com.foodconnect.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirebaseTokenRequest {

    @NotBlank(message = "Firebase ID Token is required")
    private String idToken;

    private UserRole role;

    private String fullName;

    private String phone;

    private String email;

    private String provider; // "PHONE", "GOOGLE", "EMAIL"
}
