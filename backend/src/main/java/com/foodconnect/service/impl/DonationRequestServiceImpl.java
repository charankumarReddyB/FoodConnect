package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.DonationRequest;
import com.foodconnect.entity.Organization;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.RequestStatus;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.DonationRequestRepository;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.service.DonationRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationRequestServiceImpl implements DonationRequestService {

    private final DonationRequestRepository donationRequestRepository;
    private final DonationRepository donationRepository;
    private final OrganizationRepository organizationRepository;
    private final com.foodconnect.repository.VolunteerRepository volunteerRepository;
    private final com.foodconnect.service.FcmService fcmService;

    @Value("${app.matching.default-radius-km:10.0}")
    private double defaultRadiusKm;

    @Override
    @Transactional
    public DonationRequestResponse requestDonation(UUID donationId, UUID recipientUserId, Integer requestedServings, String notes) {
        log.info("Processing donation request for donation ID {} by recipient user ID {}", donationId, recipientUserId);

        Organization recipient = organizationRepository.findByUserId(recipientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient organization profile not found for user ID: " + recipientUserId));

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + donationId));

        if (donation.getStatus() != DonationStatus.CREATED && donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException("Donation is no longer available for requesting. Status: " + donation.getStatus());
        }

        if (donation.getExpiryTime() != null && donation.getExpiryTime().isBefore(OffsetDateTime.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("Donation has expired and can no longer be requested.");
        }

        if (donationRequestRepository.existsByDonationIdAndRecipientId(donationId, recipient.getId())) {
            throw new DuplicateResourceException("Organization has already submitted a request for this donation.");
        }

        DonationRequest request = DonationRequest.builder()
                .donation(donation)
                .recipient(recipient)
                .requestedServings(requestedServings != null ? requestedServings : donation.getEstimatedServings())
                .notes(notes)
                .status(RequestStatus.PENDING)
                .requestTime(OffsetDateTime.now())
                .build();

        donation.setStatus(DonationStatus.REQUESTED);
        donationRepository.save(donation);

        DonationRequest saved = donationRequestRepository.save(request);
        log.info("Donation request created successfully with ID: {}", saved.getId());

        // Calculate proximity distance between donor and recipient
        double distanceKm = com.foodconnect.util.LocationUtils.calculateDistanceKm(
                donation.getLatitude(), donation.getLongitude(),
                recipient.getUser() != null ? recipient.getUser().getLatitude() : null,
                recipient.getUser() != null ? recipient.getUser().getLongitude() : null
        );

        String distStr = distanceKm < Double.MAX_VALUE ? String.format("%.1f km", distanceKm) : "nearby";

        // Dispatch FCM Proximity Notification to Donor
        if (donation.getDonor() != null) {
            String notificationTitle = "Food request available near you";
            String notificationBody = String.format("%s (%s away) is requesting food matching your donation '%s'.",
                    recipient.getOrganizationName(), distStr, donation.getTitle());
            fcmService.sendNotification(donation.getDonor().getId(), notificationTitle, notificationBody,
                    Map.of("donationId", donation.getId().toString(), "requestId", saved.getId().toString(), "distanceKm", distStr));
        }

        // Find eligible nearby volunteers within matching radius and notify
        try {
            volunteerRepository.findAll().forEach(vol -> {
                if (vol.getIsAvailable() != null && vol.getIsAvailable() && vol.getUser() != null) {
                    double volDist = com.foodconnect.util.LocationUtils.calculateDistanceKm(
                            donation.getLatitude(), donation.getLongitude(),
                            vol.getCurrentLatitude(), vol.getCurrentLongitude()
                    );
                    if (volDist <= defaultRadiusKm) {
                        String volTitle = "Food delivery opportunity nearby";
                        String volBody = String.format("Food pickup at %s (%s away) for %s.",
                                donation.getPickupAddress() != null ? donation.getPickupAddress() : "Donor Location",
                                String.format("%.1f km", volDist), recipient.getOrganizationName());
                        fcmService.sendNotification(vol.getUser().getId(), volTitle, volBody,
                                Map.of("donationId", donation.getId().toString(), "requestId", saved.getId().toString()));
                    }
                }
            });
        } catch (Exception e) {
            log.warn("Failed to notify nearby volunteers: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DonationRequestResponse respondToRequest(UUID requestId, UUID donorUserId, RequestStatus status) {
        log.info("Donor user ID {} responding to request ID {} with status {}", donorUserId, requestId, status);

        DonationRequest request = donationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation request not found with ID: " + requestId));

        if (!request.getDonation().getDonor().getId().equals(donorUserId)) {
            throw new UnauthorizedException("Only the donation owner can accept or reject requests.");
        }

        request.setStatus(status);
        request.setResponseTime(OffsetDateTime.now());

        if (status == RequestStatus.ACCEPTED) {
            request.getDonation().setStatus(DonationStatus.ACCEPTED);
            donationRepository.save(request.getDonation());

            // Reject all other pending requests for the same donation
            List<DonationRequest> otherRequests = donationRequestRepository.findByDonationIdAndStatus(request.getDonation().getId(), RequestStatus.PENDING);
            for (DonationRequest other : otherRequests) {
                if (!other.getId().equals(requestId)) {
                    other.setStatus(RequestStatus.REJECTED);
                    other.setResponseTime(OffsetDateTime.now());
                    donationRequestRepository.save(other);
                }
            }
        }

        DonationRequest saved = donationRequestRepository.save(request);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getRequestsForDonation(UUID donationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("requestTime").descending());
        Page<DonationRequest> pageResult = donationRequestRepository.findByDonationId(donationId, pageable);

        List<DonationRequestResponse> content = pageResult.getContent().stream()
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

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationRequestResponse> getMyRequests(UUID recipientUserId, int page, int size) {
        Organization recipient = organizationRepository.findByUserId(recipientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient organization profile not found for user ID: " + recipientUserId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("requestTime").descending());
        Page<DonationRequest> pageResult = donationRequestRepository.findByRecipientId(recipient.getId(), pageable);

        List<DonationRequestResponse> content = pageResult.getContent().stream()
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

    private DonationRequestResponse mapToResponse(DonationRequest r) {
        return DonationRequestResponse.builder()
                .id(r.getId())
                .donationId(r.getDonation() != null ? r.getDonation().getId() : null)
                .donationTitle(r.getDonation() != null ? r.getDonation().getTitle() : null)
                .recipientId(r.getRecipient() != null ? r.getRecipient().getId() : null)
                .recipientOrganizationName(r.getRecipient() != null ? r.getRecipient().getOrganizationName() : null)
                .status(r.getStatus())
                .requestedServings(r.getRequestedServings())
                .notes(r.getNotes())
                .requestTime(r.getRequestTime())
                .responseTime(r.getResponseTime())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
