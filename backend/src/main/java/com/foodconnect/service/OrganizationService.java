package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.OrganizationResponse;
import com.foodconnect.enums.OrganizationType;

import java.util.UUID;

public interface OrganizationService {
    OrganizationResponse getOrganizationByUserId(UUID userId);
    OrganizationResponse updateOrganizationCapacity(UUID userId, Integer capacityServings);
    OrganizationResponse verifyOrganization(UUID organizationId, Boolean isVerified);
    PagedResponse<OrganizationResponse> getOrganizations(OrganizationType orgType, Boolean isVerified, int page, int size);
}
