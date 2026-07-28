package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.organization.OrganizationDTO;
import org.springframework.data.domain.Pageable;

public interface OrganizationService {
    OrganizationDTO registerOrganization(Long userId, OrganizationDTO dto);
    OrganizationDTO verifyOrganization(Long orgId);
    PagedResponse<OrganizationDTO> getOrganizations(Boolean verified, Pageable pageable);
    OrganizationDTO getOrganizationById(Long id);
}
