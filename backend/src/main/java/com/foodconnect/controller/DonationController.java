package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.donation.DonationCreateRequest;
import com.foodconnect.dto.donation.DonationResponse;
import com.foodconnect.dto.donation.DonationSearchRequest;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Endpoints for posting, querying, and managing food donations")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Create a new food donation post")
    public ResponseEntity<ApiResponse<DonationResponse>> createDonation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DonationCreateRequest request) {
        DonationResponse response = donationService.createDonation(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donation created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation details by ID")
    public ResponseEntity<ApiResponse<DonationResponse>> getDonationById(@PathVariable Long id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success("Donation fetched successfully", response));
    }

    @GetMapping("/donor/{donorId}")
    @Operation(summary = "Get donations created by a specific donor")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getDonationsByDonor(
            @PathVariable Long donorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DonationResponse> response = donationService.getDonationsByDonor(
                donorId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Donor donations fetched", response));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Search available donations near a latitude and longitude radius (Haversine formula)")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> searchNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm) {
        DonationSearchRequest searchRequest = new DonationSearchRequest();
        searchRequest.setLatitude(latitude);
        searchRequest.setLongitude(longitude);
        searchRequest.setRadiusKm(radiusKm);

        List<DonationResponse> response = donationService.searchNearbyDonations(searchRequest);
        return ResponseEntity.ok(ApiResponse.success("Nearby donations fetched", response));
    }

    @GetMapping
    @Operation(summary = "List donations filtered by status or category")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getDonations(
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponse<DonationResponse> response;
        if (category != null) {
            response = donationService.getDonationsByCategory(category, status != null ? status : DonationStatus.CREATED, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        } else {
            response = donationService.getDonationsByStatus(status != null ? status : DonationStatus.CREATED, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        }
        return ResponseEntity.ok(ApiResponse.success("Donations fetched", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Update status of a donation")
    public ResponseEntity<ApiResponse<DonationResponse>> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam DonationStatus status) {
        DonationResponse response = donationService.updateDonationStatus(id, currentUser.getId(), status);
        return ResponseEntity.ok(ApiResponse.success("Donation status updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Delete a donation")
    public ResponseEntity<ApiResponse<Void>> deleteDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        donationService.deleteDonation(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Donation deleted successfully"));
    }
}
