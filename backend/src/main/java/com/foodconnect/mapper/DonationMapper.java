package com.foodconnect.mapper;

import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.FoodImage;
import com.foodconnect.util.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class DonationMapper {

    private final UserMapper userMapper;

    public DonationResponse toResponse(Donation donation) {
        return toResponse(donation, null, null);
    }

    public DonationResponse toResponse(Donation donation, Double userLat, Double userLon) {
        if (donation == null) return null;

        Double distance = null;
        if (userLat != null && userLon != null && donation.getLatitude() != null && donation.getLongitude() != null) {
            distance = DistanceCalculator.calculateDistanceInKm(userLat, userLon, donation.getLatitude(), donation.getLongitude());
        }

        return DonationResponse.builder()
                .id(donation.getId())
                .donor(userMapper.toResponse(donation.getDonor()))
                .foodName(donation.getFoodName())
                .description(donation.getDescription())
                .category(donation.getCategory())
                .vegNonVeg(donation.getVegNonVeg())
                .quantity(donation.getQuantity())
                .estimatedServings(donation.getEstimatedServings())
                .preparedTime(donation.getPreparedTime())
                .pickupDeadline(donation.getPickupDeadline())
                .address(donation.getAddress())
                .latitude(donation.getLatitude())
                .longitude(donation.getLongitude())
                .deliveryMethod(donation.getDeliveryMethod())
                .status(donation.getStatus())
                .imageUrls(donation.getImages() != null ? 
                        donation.getImages().stream().map(FoodImage::getImageUrl).toList() : Collections.emptyList())
                .distanceKm(distance)
                .createdAt(donation.getCreatedAt())
                .updatedAt(donation.getUpdatedAt())
                .build();
    }
}
