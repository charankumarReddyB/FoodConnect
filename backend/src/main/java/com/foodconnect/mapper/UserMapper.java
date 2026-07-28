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
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().getName().name() : null)
                .profileImage(user.getProfileImage())
                .address(user.getAddress())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
