package com.foodconnect.mapper;

import com.foodconnect.dto.response.OrganizationResponse;
import com.foodconnect.entity.Organization;
import com.foodconnect.util.DistanceCalculator;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public OrganizationResponse toResponse(Organization org) {
        return toResponse(org, null, null);
    }

    public OrganizationResponse toResponse(Organization org, Double userLat, Double userLon) {
        if (org == null) return null;

        Double distance = null;
        if (userLat != null && userLon != null && org.getLatitude() != null && org.getLongitude() != null) {
            distance = DistanceCalculator.calculateDistanceInKm(userLat, userLon, org.getLatitude(), org.getLongitude());
        }

        return OrganizationResponse.builder()
                .id(org.getId())
                .organizationName(org.getOrganizationName())
                .type(org.getType())
                .email(org.getEmail())
                .phone(org.getPhone())
                .address(org.getAddress())
                .latitude(org.getLatitude())
                .longitude(org.getLongitude())
                .verified(org.getVerified())
                .userId(org.getUser() != null ? org.getUser().getId() : null)
                .distanceKm(distance)
                .createdAt(org.getCreatedAt())
                .build();
    }
}
