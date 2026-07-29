package com.foodconnect.repository;

import com.foodconnect.entity.Volunteer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, UUID> {
    Optional<Volunteer> findByUserId(UUID userId);
    Page<Volunteer> findByIsAvailable(Boolean isAvailable, Pageable pageable);
}
