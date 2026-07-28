package com.foodconnect.repository;

import com.foodconnect.entity.Delivery;
import com.foodconnect.enums.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    Optional<Delivery> findByDonationId(Long donationId);
    Page<Delivery> findByVolunteerId(Long volunteerId, Pageable pageable);
    Page<Delivery> findByStatus(DeliveryStatus status, Pageable pageable);
}
