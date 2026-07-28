package com.foodconnect.repository;

import com.foodconnect.entity.Organization;
import com.foodconnect.enums.OrganizationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByUserId(Long userId);
    Page<Organization> findByVerified(Boolean verified, Pageable pageable);
    Page<Organization> findByType(OrganizationType type, Pageable pageable);
}
