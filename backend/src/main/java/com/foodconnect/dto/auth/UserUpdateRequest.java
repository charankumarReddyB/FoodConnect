package com.foodconnect.dto.auth;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String phone;
    private String profileImage;
    private String address;
    private Double latitude;
    private Double longitude;
}
