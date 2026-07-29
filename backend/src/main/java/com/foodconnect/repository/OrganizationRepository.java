package com.foodconnect.repository;

import com.foodconnect.entity.Organization;
import com.foodconnect.enums.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    Optional<Organization> findByUserId(UUID userId);
    Optional<Organization> findByRegistrationNumber(String registrationNumber);
    Page<Organization> findByOrgType(OrganizationType orgType, Pageable pageable);
    Page<Organization> findByIsVerified(Boolean isVerified, Pageable pageable);
}
