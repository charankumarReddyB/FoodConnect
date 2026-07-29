package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.OrganizationResponse;
import com.foodconnect.entity.Organization;
import com.foodconnect.enums.OrganizationType;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationByUserId(UUID userId) {
        Organization org = organizationRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization profile not found for user ID: " + userId));
        return mapToResponse(org);
    }

    @Override
    @Transactional
    public OrganizationResponse updateOrganizationCapacity(UUID userId, Integer capacityServings) {
        Organization org = organizationRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization profile not found for user ID: " + userId));

        org.setCapacityServings(capacityServings);
        Organization updated = organizationRepository.save(org);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrganizationResponse verifyOrganization(UUID organizationId, Boolean isVerified) {
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found with ID: " + organizationId));

        org.setIsVerified(isVerified != null ? isVerified : true);
        Organization updated = organizationRepository.save(org);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrganizationResponse> getOrganizations(OrganizationType orgType, Boolean isVerified, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Organization> pageResult;

        if (orgType != null) {
            pageResult = organizationRepository.findByOrgType(orgType, pageable);
        } else if (isVerified != null) {
            pageResult = organizationRepository.findByIsVerified(isVerified, pageable);
        } else {
            pageResult = organizationRepository.findAll(pageable);
        }

        List<OrganizationResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PagedResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    private OrganizationResponse mapToResponse(Organization o) {
        return OrganizationResponse.builder()
                .id(o.getId())
                .userId(o.getUser() != null ? o.getUser().getId() : null)
                .organizationName(o.getOrganizationName())
                .orgType(o.getOrgType())
                .registrationNumber(o.getRegistrationNumber())
                .contactPerson(o.getContactPerson())
                .contactEmail(o.getContactEmail())
                .contactPhone(o.getContactPhone())
                .address(o.getAddress())
                .latitude(o.getLatitude())
                .longitude(o.getLongitude())
                .isVerified(o.getIsVerified())
                .capacityServings(o.getCapacityServings())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
