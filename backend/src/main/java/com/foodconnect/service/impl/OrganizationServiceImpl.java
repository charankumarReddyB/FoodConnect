package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.organization.OrganizationDTO;
import com.foodconnect.entity.Organization;
import com.foodconnect.entity.User;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public OrganizationDTO registerOrganization(Long userId, OrganizationDTO dto) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        }

        Organization org = Organization.builder()
                .organizationName(dto.getOrganizationName())
                .type(dto.getType())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .verified(false)
                .user(user)
                .build();

        Organization saved = organizationRepository.save(org);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public OrganizationDTO verifyOrganization(Long orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", orgId));

        org.setVerified(true);
        Organization updated = organizationRepository.save(org);
        return toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrganizationDTO> getOrganizations(Boolean verified, Pageable pageable) {
        Page<Organization> page;
        if (verified != null) {
            page = organizationRepository.findByVerified(verified, pageable);
        } else {
            page = organizationRepository.findAll(pageable);
        }

        List<OrganizationDTO> content = page.getContent().stream().map(this::toDTO).toList();
        return new PagedResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationDTO getOrganizationById(Long id) {
        Organization org = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
        return toDTO(org);
    }

    private OrganizationDTO toDTO(Organization org) {
        return OrganizationDTO.builder()
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
                .createdAt(org.getCreatedAt())
                .build();
    }
}
