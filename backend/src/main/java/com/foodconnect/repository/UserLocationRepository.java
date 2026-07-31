package com.foodconnect.repository;

import com.foodconnect.entity.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
    Optional<UserLocation> findTopByUserIdOrderByUpdatedAtDesc(UUID userId);
}
