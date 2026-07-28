package com.foodconnect.service;

import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import com.foodconnect.response.PagedResponse;

import java.util.List;

public interface DonationService {
    DonationResponse createDonation(Long donorId, DonationCreateRequest request);
    DonationResponse getDonationById(Long id, Double currentLat, Double currentLon);
    DonationResponse updateDonation(Long donationId, Long currentUserId, DonationUpdateRequest request);
    void deleteDonation(Long donationId, Long currentUserId);
    PagedResponse<DonationResponse> getMyDonations(Long donorId, int page, int size);
    PagedResponse<DonationResponse> getDonationsByStatus(DonationStatus status, int page, int size);
    List<DonationResponse> getNearbyDonations(Double lat, Double lon, Double radiusKm, String category, String vegNonVeg);
    PagedResponse<DonationResponse> filterDonations(FoodCategory category, VegNonVeg vegNonVeg, DonationStatus status, int page, int size, String sortBy, String sortDir);
    DonationResponse updateDonationStatus(Long donationId, DonationStatus status);
}
