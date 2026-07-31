package com.foodconnect.mapper;

import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .address(user.getAddress())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .googleId(user.getGoogleId())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .authProviders(user.getAuthProviders())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
