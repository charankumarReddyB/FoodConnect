package com.foodconnect.repository;

import com.foodconnect.entity.DonationRequest;
import com.foodconnect.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {
    List<DonationRequest> findByDonationId(Long donationId);
    Page<DonationRequest> findByRecipientId(Long recipientId, Pageable pageable);
    Optional<DonationRequest> findByDonationIdAndRecipientId(Long donationId, Long recipientId);
    Boolean existsByDonationIdAndRecipientId(Long donationId, Long recipientId);
    List<DonationRequest> findByDonationIdAndStatus(Long donationId, RequestStatus status);
}
