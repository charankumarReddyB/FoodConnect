package com.foodconnect.dto.response;

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
public class VolunteerResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String vehicleType;
    private String licenseNumber;
    private Boolean isAvailable;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double rating;
    private Integer completedDeliveriesCount;
    private OffsetDateTime createdAt;
}
