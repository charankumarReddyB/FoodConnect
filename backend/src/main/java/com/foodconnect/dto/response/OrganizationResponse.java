package com.foodconnect.dto.response;

import com.foodconnect.enums.OrganizationType;
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
public class OrganizationResponse {
    private UUID id;
    private UUID userId;
    private String organizationName;
    private OrganizationType orgType;
    private String registrationNumber;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private Double latitude;
    private Double longitude;
    private Boolean isVerified;
    private Integer capacityServings;
    private OffsetDateTime createdAt;
}
