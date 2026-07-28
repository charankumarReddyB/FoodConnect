package com.foodconnect.dto.response;

import com.foodconnect.enums.OrganizationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrganizationResponse {
    private Long id;
    private String organizationName;
    private OrganizationType type;
    private String email;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean verified;
    private Long userId;
    private Double distanceKm;
    private LocalDateTime createdAt;
}
