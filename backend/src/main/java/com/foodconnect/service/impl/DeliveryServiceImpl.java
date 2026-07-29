package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.entity.Delivery;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.enums.DeliveryStatus;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DeliveryRepository;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.VolunteerRepository;
import com.foodconnect.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DonationRepository donationRepository;
    private final VolunteerRepository volunteerRepository;

    @Override
    @Transactional
    public DeliveryResponse claimDelivery(UUID donationId, UUID volunteerUserId) {
        log.info("Volunteer user ID {} claiming delivery for donation ID {}", volunteerUserId, donationId);

        Volunteer volunteer = volunteerRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + volunteerUserId));

        if (!volunteer.getIsAvailable()) {
            throw new BadRequestException("Volunteer is not currently set as available for deliveries.");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + donationId));

        if (donation.getStatus() != DonationStatus.ACCEPTED && donation.getStatus() != DonationStatus.CREATED) {
            throw new BadRequestException("Donation cannot be claimed for delivery in current status: " + donation.getStatus());
        }

        Delivery delivery = deliveryRepository.findByDonationId(donationId)
                .orElseGet(() -> Delivery.builder()
                        .donation(donation)
                        .status(DeliveryStatus.UNASSIGNED)
                        .build());

        String pickupPin = String.format("%04d", (int)(Math.random() * 9000) + 1000);
        String deliveryPin = String.format("%04d", (int)(Math.random() * 9000) + 1000);

        delivery.setVolunteer(volunteer);
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setPickupVerificationCode(pickupPin);
        delivery.setDeliveryVerificationCode(deliveryPin);

        donation.setStatus(DonationStatus.ASSIGNED);
        donationRepository.save(donation);

        Delivery saved = deliveryRepository.save(delivery);
        log.info("Delivery claimed successfully by volunteer ID: {}. Delivery ID: {}", volunteer.getId(), saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DeliveryResponse updateDeliveryStatus(UUID deliveryId, UUID volunteerUserId, DeliveryStatus status, String verificationCode) {
        log.info("Updating delivery ID {} to status {}", deliveryId, status);

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found with ID: " + deliveryId));

        if (delivery.getVolunteer() == null || !delivery.getVolunteer().getUser().getId().equals(volunteerUserId)) {
            throw new UnauthorizedException("Only the assigned volunteer can update this delivery.");
        }

        if (status == DeliveryStatus.PICKED_UP) {
            if (verificationCode != null && !verificationCode.equals(delivery.getPickupVerificationCode())) {
                throw new BadRequestException("Invalid pickup verification PIN code.");
            }
            delivery.setStatus(DeliveryStatus.PICKED_UP);
            delivery.setPickupTime(OffsetDateTime.now());
            delivery.getDonation().setStatus(DonationStatus.PICKED_UP);
        } else if (status == DeliveryStatus.DELIVERED) {
            if (verificationCode != null && !verificationCode.equals(delivery.getDeliveryVerificationCode())) {
                throw new BadRequestException("Invalid delivery verification PIN code.");
            }
            delivery.setStatus(DeliveryStatus.DELIVERED);
            delivery.setDeliveryTime(OffsetDateTime.now());
            delivery.getDonation().setStatus(DonationStatus.DELIVERED);

            // Increment volunteer delivery metrics
            Volunteer volunteer = delivery.getVolunteer();
            volunteer.setCompletedDeliveriesCount(volunteer.getCompletedDeliveriesCount() + 1);
            volunteerRepository.save(volunteer);
        } else {
            delivery.setStatus(status);
        }

        donationRepository.save(delivery.getDonation());
        Delivery saved = deliveryRepository.save(delivery);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryByDonationId(UUID donationId) {
        Delivery delivery = deliveryRepository.findByDonationId(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery record not found for donation ID: " + donationId));
        return mapToResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeliveryResponse> getMyDeliveries(UUID volunteerUserId, int page, int size) {
        Volunteer volunteer = volunteerRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + volunteerUserId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Delivery> pageResult = deliveryRepository.findByVolunteerId(volunteer.getId(), pageable);

        List<DeliveryResponse> content = pageResult.getContent().stream()
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

    private DeliveryResponse mapToResponse(Delivery d) {
        return DeliveryResponse.builder()
                .id(d.getId())
                .donationId(d.getDonation() != null ? d.getDonation().getId() : null)
                .donationTitle(d.getDonation() != null ? d.getDonation().getTitle() : null)
                .pickupAddress(d.getDonation() != null ? d.getDonation().getPickupAddress() : null)
                .volunteerId(d.getVolunteer() != null ? d.getVolunteer().getId() : null)
                .volunteerName(d.getVolunteer() != null && d.getVolunteer().getUser() != null ? d.getVolunteer().getUser().getFullName() : null)
                .volunteerPhone(d.getVolunteer() != null && d.getVolunteer().getUser() != null ? d.getVolunteer().getUser().getPhone() : null)
                .requestId(d.getRequest() != null ? d.getRequest().getId() : null)
                .status(d.getStatus())
                .pickupTime(d.getPickupTime())
                .deliveryTime(d.getDeliveryTime())
                .pickupVerificationCode(d.getPickupVerificationCode())
                .deliveryVerificationCode(d.getDeliveryVerificationCode())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
