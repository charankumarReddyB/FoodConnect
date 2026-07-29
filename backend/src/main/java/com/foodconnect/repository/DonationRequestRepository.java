package com.foodconnect.repository;

import com.foodconnect.entity.DonationRequest;
import com.foodconnect.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DonationRequestRepository extends JpaRepository<DonationRequest, UUID> {
    Page<DonationRequest> findByRecipientId(UUID recipientId, Pageable pageable);
    Page<DonationRequest> findByDonationId(UUID donationId, Pageable pageable);
    List<DonationRequest> findByDonationIdAndStatus(UUID donationId, RequestStatus status);
    Optional<DonationRequest> findByDonationIdAndRecipientId(UUID donationId, UUID recipientId);
    Boolean existsByDonationIdAndRecipientId(UUID donationId, UUID recipientId);
}
