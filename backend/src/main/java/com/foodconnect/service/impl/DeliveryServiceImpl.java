package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.delivery.DeliveryResponse;
import com.foodconnect.dto.delivery.DeliveryStatusUpdateRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final DonationRepository donationRepository;
    private final VolunteerRepository volunteerRepository;

    @Override
    @Transactional
    public DeliveryResponse claimDelivery(Long userId, Long donationId) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("User is not registered as a volunteer"));

        if (!volunteer.getAvailability()) {
            throw new BadRequestException("Volunteer is currently marked unavailable");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));

        if (deliveryRepository.findByDonationId(donationId).isPresent()) {
            throw new BadRequestException("Delivery is already assigned for this donation");
        }

        Delivery delivery = Delivery.builder()
                .donation(donation)
                .volunteer(volunteer)
                .status(DeliveryStatus.ASSIGNED)
                .build();

        Delivery saved = deliveryRepository.save(delivery);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long userId, Long deliveryId, DeliveryStatusUpdateRequest request) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        if (delivery.getVolunteer() == null || !delivery.getVolunteer().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Only the assigned volunteer can update this delivery");
        }

        delivery.setStatus(request.getStatus());

        if (request.getCurrentLocation() != null) {
            delivery.setCurrentLocation(request.getCurrentLocation());
        }

        if (request.getStatus() == DeliveryStatus.PICKED_UP) {
            delivery.setPickupTime(LocalDateTime.now());
            Donation donation = delivery.getDonation();
            donation.setStatus(DonationStatus.IN_TRANSIT);
            donationRepository.save(donation);
        } else if (request.getStatus() == DeliveryStatus.DELIVERED) {
            delivery.setDeliveryTime(LocalDateTime.now());
            Donation donation = delivery.getDonation();
            donation.setStatus(DonationStatus.COMPLETED);
            donationRepository.save(donation);

            Volunteer volunteer = delivery.getVolunteer();
            volunteer.setCompletedDeliveries(volunteer.getCompletedDeliveries() + 1);
            volunteerRepository.save(volunteer);
        }

        Delivery updated = deliveryRepository.save(delivery);
        return toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));
        return toResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeliveryResponse> getDeliveriesByVolunteer(Long userId, Pageable pageable) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "userId", userId));

        Page<Delivery> page = deliveryRepository.findByVolunteerId(volunteer.getId(), pageable);
        List<DeliveryResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PagedResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeliveryResponse> getDeliveriesByStatus(DeliveryStatus status, Pageable pageable) {
        Page<Delivery> page = deliveryRepository.findByStatus(status, pageable);
        List<DeliveryResponse> content = page.getContent().stream().map(this::toResponse).toList();
        return new PagedResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    private DeliveryResponse toResponse(Delivery delivery) {
        return DeliveryResponse.builder()
                .id(delivery.getId())
                .donationId(delivery.getDonation().getId())
                .foodName(delivery.getDonation().getFoodName())
                .pickupAddress(delivery.getDonation().getAddress())
                .pickupLat(delivery.getDonation().getLatitude())
                .pickupLng(delivery.getDonation().getLongitude())
                .volunteerId(delivery.getVolunteer() != null ? delivery.getVolunteer().getId() : null)
                .volunteerName(delivery.getVolunteer() != null ? delivery.getVolunteer().getUser().getName() : null)
                .volunteerPhone(delivery.getVolunteer() != null ? delivery.getVolunteer().getUser().getPhone() : null)
                .pickupTime(delivery.getPickupTime())
                .deliveryTime(delivery.getDeliveryTime())
                .status(delivery.getStatus())
                .currentLocation(delivery.getCurrentLocation())
                .build();
    }
}
