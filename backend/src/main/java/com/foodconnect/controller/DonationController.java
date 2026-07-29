package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Endpoints for posting, querying, and managing food donations")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Create a new food donation post")
    public ResponseEntity<ApiResponse<DonationResponse>> createDonation(@Valid @RequestBody DonationCreateRequest request) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DonationResponse response = donationService.createDonation(authenticatedUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donation created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation details by ID")
    public ResponseEntity<ApiResponse<DonationResponse>> getDonationById(@PathVariable UUID id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success("Donation fetched successfully", response));
    }

    @GetMapping("/donor/{donorId}")
    @Operation(summary = "Get donations created by a specific donor")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getDonationsByDonor(
            @PathVariable UUID donorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DonationResponse> response = donationService.getMyDonations(donorId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Donor donations fetched", response));
    }

    @GetMapping("/nearby")
    @Operation(summary = "Search available donations near a latitude and longitude radius")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> searchNearby(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(required = false) FoodType foodType) {
        List<DonationResponse> response = donationService.getNearbyDonations(latitude, longitude, radiusKm, foodType);
        return ResponseEntity.ok(ApiResponse.success("Nearby donations fetched", response));
    }

    @GetMapping
    @Operation(summary = "List donations filtered by status")
    public ResponseEntity<ApiResponse<PagedResponse<DonationResponse>>> getDonations(
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DonationResponse> response = donationService.getDonationsByStatus(
                status != null ? status : DonationStatus.CREATED, page, size);
        return ResponseEntity.ok(ApiResponse.success("Donations fetched", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Update a donation post")
    public ResponseEntity<ApiResponse<DonationResponse>> updateDonation(
            @PathVariable UUID id,
            @RequestBody DonationUpdateRequest request) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DonationResponse response = donationService.updateDonation(id, authenticatedUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Donation updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Update status of a donation")
    public ResponseEntity<ApiResponse<DonationResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam DonationStatus status) {
        DonationResponse response = donationService.updateDonationStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Donation status updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Delete a donation post")
    public ResponseEntity<ApiResponse<Void>> deleteDonation(@PathVariable UUID id) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        donationService.deleteDonation(id, authenticatedUserId);
        return ResponseEntity.ok(ApiResponse.success("Donation deleted successfully"));
    }
}
