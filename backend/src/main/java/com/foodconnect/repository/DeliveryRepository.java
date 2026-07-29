package com.foodconnect.repository;

import com.foodconnect.entity.Delivery;
import com.foodconnect.enums.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, UUID> {
    Optional<Delivery> findByDonationId(UUID donationId);
    Page<Delivery> findByVolunteerId(UUID volunteerId, Pageable pageable);
    Page<Delivery> findByStatus(DeliveryStatus status, Pageable pageable);
}
