package com.foodconnect.service.impl;

import com.foodconnect.constants.AppConstants;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.FoodImage;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.DonationMapper;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.FoodImageRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.response.PagedResponse;
import com.foodconnect.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationServiceImpl implements DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final FoodImageRepository foodImageRepository;
    private final DonationMapper donationMapper;

    @Override
    @Transactional
    public DonationResponse createDonation(Long donorId, DonationCreateRequest request) {
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", donorId));

        Donation donation = Donation.builder()
                .donor(donor)
                .foodName(request.getFoodName())
                .description(request.getDescription())
                .category(request.getCategory())
                .vegNonVeg(request.getVegNonVeg())
                .quantity(request.getQuantity())
                .estimatedServings(request.getEstimatedServings())
                .preparedTime(request.getPreparedTime())
                .pickupDeadline(request.getPickupDeadline())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .deliveryMethod(request.getDeliveryMethod())
                .status(DonationStatus.CREATED)
                .images(new ArrayList<>())
                .build();

        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String url : request.getImageUrls()) {
                FoodImage img = FoodImage.builder()
                        .donation(donation)
                        .imageUrl(url)
                        .build();
                donation.getImages().add(img);
            }
        }

        Donation saved = donationRepository.save(donation);
        return donationMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DonationResponse getDonationById(Long id, Double currentLat, Double currentLon) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", id));
        return donationMapper.toResponse(donation, currentLat, currentLon);
    }

    @Override
    @Transactional
    public DonationResponse updateDonation(Long donationId, Long currentUserId, DonationUpdateRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));

        if (!donation.getDonor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the donation owner can update this donation.");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.CANCELLED) {
            throw new BadRequestException("Cannot update donation in status: " + donation.getStatus());
        }

        if (request.getFoodName() != null) donation.setFoodName(request.getFoodName());
        if (request.getDescription() != null) donation.setDescription(request.getDescription());
        if (request.getCategory() != null) donation.setCategory(request.getCategory());
        if (request.getVegNonVeg() != null) donation.setVegNonVeg(request.getVegNonVeg());
        if (request.getQuantity() != null) donation.setQuantity(request.getQuantity());
        if (request.getEstimatedServings() != null) donation.setEstimatedServings(request.getEstimatedServings());
        if (request.getPreparedTime() != null) donation.setPreparedTime(request.getPreparedTime());
        if (request.getPickupDeadline() != null) donation.setPickupDeadline(request.getPickupDeadline());
        if (request.getAddress() != null) donation.setAddress(request.getAddress());
        if (request.getLatitude() != null) donation.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) donation.setLongitude(request.getLongitude());
        if (request.getDeliveryMethod() != null) donation.setDeliveryMethod(request.getDeliveryMethod());

        if (request.getImageUrls() != null) {
            donation.getImages().clear();
            for (String url : request.getImageUrls()) {
                FoodImage img = FoodImage.builder()
                        .donation(donation)
                        .imageUrl(url)
                        .build();
                donation.getImages().add(img);
            }
        }

        Donation updated = donationRepository.save(donation);
        return donationMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDonation(Long donationId, Long currentUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));

        if (!donation.getDonor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the donation owner can delete this donation.");
        }

        donationRepository.delete(donation);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> getMyDonations(Long donorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Donation> pageResult = donationRepository.findByDonorId(donorId, pageable);

        List<DonationResponse> content = pageResult.getContent().stream()
                .map(donationMapper::toResponse)
                .toList();

        return PagedResponse.<DonationResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> getDonationsByStatus(DonationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Donation> pageResult = donationRepository.findByStatus(status, pageable);

        List<DonationResponse> content = pageResult.getContent().stream()
                .map(donationMapper::toResponse)
                .toList();

        return PagedResponse.<DonationResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonationResponse> getNearbyDonations(Double lat, Double lon, Double radiusKm, String category, String vegNonVeg) {
        double radius = radiusKm != null ? radiusKm : AppConstants.DEFAULT_SEARCH_RADIUS_KM;
        List<Donation> donations = donationRepository.findNearbyDonations(lat, lon, radius, DonationStatus.CREATED.name(), category, vegNonVeg);

        return donations.stream()
                .map(d -> donationMapper.toResponse(d, lat, lon))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DonationResponse> filterDonations(FoodCategory category, VegNonVeg vegNonVeg, DonationStatus status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Donation> pageResult = donationRepository.filterDonations(category, vegNonVeg, status, pageable);

        List<DonationResponse> content = pageResult.getContent().stream()
                .map(donationMapper::toResponse)
                .toList();

        return PagedResponse.<DonationResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    @Transactional
    public DonationResponse updateDonationStatus(Long donationId, DonationStatus status) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation", "id", donationId));
        donation.setStatus(status);
        Donation updated = donationRepository.save(donation);
        return donationMapper.toResponse(updated);
    }
}
