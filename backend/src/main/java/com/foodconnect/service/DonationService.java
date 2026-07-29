package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;

import java.util.List;
import java.util.UUID;

public interface DonationService {
    DonationResponse createDonation(UUID donorId, DonationCreateRequest request);
    DonationResponse getDonationById(UUID id);
    DonationResponse updateDonation(UUID donationId, UUID currentUserId, DonationUpdateRequest request);
    void deleteDonation(UUID donationId, UUID currentUserId);
    PagedResponse<DonationResponse> getMyDonations(UUID donorId, int page, int size);
    PagedResponse<DonationResponse> getDonationsByStatus(DonationStatus status, int page, int size);
    List<DonationResponse> getNearbyDonations(Double lat, Double lon, Double radiusKm, FoodType foodType);
    DonationResponse updateDonationStatus(UUID donationId, DonationStatus status);
}
