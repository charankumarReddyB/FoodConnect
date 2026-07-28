package com.foodconnect.dto.request;

import lombok.Data;

@Data
public class UserProfileUpdateRequest {
    private String name;
    private String phone;
    private String profileImage;
    private String address;
    private Double latitude;
    private Double longitude;
}
