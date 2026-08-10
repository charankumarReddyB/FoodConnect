package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.FoodImage;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.DonationMapper;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.DonationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final DonationMapper donationMapper;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.foodconnect.repository.firestore.FirestoreDonationRepository firestoreDonationRepository;

    @Override
    @Transactional
    public DonationResponse createDonation(UUID donorId, DonationCreateRequest request) {
        log.info("Creating new donation post for donor ID: {}", donorId);

        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found with ID: " + donorId));

        Donation donation = Donation.builder()
                .donor(donor)
                .title(request.getTitle())
                .description(request.getDescription())
                .foodType(request.getFoodType())
                .quantityDescription(request.getQuantityDescription())
                .estimatedServings(request.getEstimatedServings())
                .preparedTime(request.getPreparedTime())
                .expiryTime(request.getExpiryTime())
                .pickupAddress(request.getPickupAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .deliveryMethod(request.getDeliveryMethod())
                .status(DonationStatus.CREATED)
                .images(new ArrayList<>())
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (int i = 0; i < request.getImageUrls().size(); i++) {
                FoodImage img = FoodImage.builder()
                        .donation(donation)
                        .imageUrl(request.getImageUrls().get(i))
                        .isPrimary(i == 0)
                        .build();
                donation.getImages().add(img);
            }
        }

        Donation saved = donationRepository.save(donation);
        try { firestoreDonationRepository.save(saved); } catch (Exception ignored) {}
        log.info("Donation created successfully with ID: {}", saved.getId());
        return donationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponse getDonationById(UUID id) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + id));
        return donationMapper.toResponse(donation);
    }

    @Override
    @Transactional
    public DonationResponse updateDonation(UUID donationId, UUID currentUserId, DonationUpdateRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + donationId));

        if (!donation.getDonor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the donation owner can update this post.");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.CANCELLED) {
            throw new BadRequestException("Cannot update donation in terminal status: " + donation.getStatus());
        }

        if (request.getFoodName() != null) donation.setTitle(request.getFoodName());
        if (request.getDescription() != null) donation.setDescription(request.getDescription());
        if (request.getQuantity() != null) donation.setQuantityDescription(request.getQuantity());
        if (request.getEstimatedServings() != null) donation.setEstimatedServings(request.getEstimatedServings());
        if (request.getAddress() != null) donation.setPickupAddress(request.getAddress());
        if (request.getLatitude() != null) donation.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) donation.setLongitude(request.getLongitude());

        Donation updated = donationRepository.save(donation);
        return donationMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDonation(UUID donationId, UUID currentUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + donationId));

        if (!donation.getDonor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the donation owner can delete this post.");
        }

        donationRepository.delete(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> getMyDonations(UUID donorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Donation> pageResult = donationRepository.findByDonorId(donorId, pageable);

        List<DonationResponse> content = pageResult.getContent().stream()
                .map(donationMapper::toResponse)
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
    public PagedResponse<DonationResponse> getDonationsByStatus(DonationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Donation> pageResult = donationRepository.findByStatus(status, pageable);

        List<DonationResponse> content = pageResult.getContent().stream()
                .map(donationMapper::toResponse)
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
    public List<DonationResponse> getNearbyDonations(Double lat, Double lon, Double radiusKm, FoodType foodType) {
        log.info("Fetching nearby donations for lat={}, lon={}, foodType={}", lat, lon, foodType);
        Pageable pageable = PageRequest.of(0, 50);
        Page<Donation> activePage = donationRepository.findActiveDonations(DonationStatus.CREATED, foodType, pageable);

        return activePage.getContent().stream()
                .map(donationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public DonationResponse updateDonationStatus(UUID donationId, DonationStatus status) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with ID: " + donationId));
        donation.setStatus(status);
        Donation updated = donationRepository.save(donation);
        return donationMapper.toResponse(updated);
    }
}
