package com.foodconnect.mapper;

import com.foodconnect.dto.response.OrganizationResponse;
import com.foodconnect.entity.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public OrganizationResponse toResponse(Organization org) {
        if (org == null) return null;

        return OrganizationResponse.builder()
                .id(org.getId())
                .userId(org.getUser() != null ? org.getUser().getId() : null)
                .organizationName(org.getOrganizationName())
                .orgType(org.getOrgType())
                .registrationNumber(org.getRegistrationNumber())
                .contactPerson(org.getContactPerson())
                .contactEmail(org.getContactEmail())
                .contactPhone(org.getContactPhone())
                .address(org.getAddress())
                .latitude(org.getLatitude())
                .longitude(org.getLongitude())
                .isVerified(org.getIsVerified())
                .capacityServings(org.getCapacityServings())
                .createdAt(org.getCreatedAt())
                .build();
    }
}
