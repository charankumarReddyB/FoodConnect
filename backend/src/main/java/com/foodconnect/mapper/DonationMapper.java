package com.foodconnect.mapper;

import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.FoodImage;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class DonationMapper {

    public DonationResponse toResponse(Donation donation) {
        if (donation == null) return null;

        return DonationResponse.builder()
                .id(donation.getId())
                .donorId(donation.getDonor() != null ? donation.getDonor().getId() : null)
                .donorName(donation.getDonor() != null ? donation.getDonor().getFullName() : null)
                .donorEmail(donation.getDonor() != null ? donation.getDonor().getEmail() : null)
                .title(donation.getTitle())
                .description(donation.getDescription())
                .foodType(donation.getFoodType())
                .quantityDescription(donation.getQuantityDescription())
                .estimatedServings(donation.getEstimatedServings())
                .preparedTime(donation.getPreparedTime())
                .expiryTime(donation.getExpiryTime())
                .pickupAddress(donation.getPickupAddress())
                .latitude(donation.getLatitude())
                .longitude(donation.getLongitude())
                .deliveryMethod(donation.getDeliveryMethod())
                .status(donation.getStatus())
                .imageUrls(donation.getImages() != null ?
                        donation.getImages().stream().map(FoodImage::getImageUrl).toList() : Collections.emptyList())
                .createdAt(donation.getCreatedAt())
                .build();
    }
}
