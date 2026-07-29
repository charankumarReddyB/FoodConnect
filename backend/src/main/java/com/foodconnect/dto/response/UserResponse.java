package com.foodconnect.dto.response;

import com.foodconnect.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String phone;
    private String fullName;
    private UserRole role;
    private String profileImageUrl;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean isActive;
    private Boolean emailVerified;
    private OffsetDateTime createdAt;
}
