package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.enums.RequestStatus;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.DonationRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
@Tag(name = "Donation Requests", description = "Endpoints for NGO/Shelter donation requests and donor responses")
public class DonationRequestController {

    private final DonationRequestService donationRequestService;

    @PostMapping("/donation/{donationId}")
    @PreAuthorize("hasAnyRole('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'SHELTER', 'ADMIN')")
    @Operation(summary = "Submit a recipient request for an active donation post")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> requestDonation(
            @PathVariable UUID donationId,
            @RequestParam(required = false) Integer requestedServings,
            @RequestParam(required = false) String notes) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DonationRequestResponse response = donationRequestService.requestDonation(donationId, authenticatedUserId, requestedServings, notes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donation requested successfully", response));
    }

    @PatchMapping("/{requestId}/respond")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Donor: Accept or reject a recipient request")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> respondToRequest(
            @PathVariable UUID requestId,
            @RequestParam RequestStatus status) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DonationRequestResponse response = donationRequestService.respondToRequest(requestId, authenticatedUserId, status);
        return ResponseEntity.ok(ApiResponse.success("Request status updated to " + status, response));
    }

    @GetMapping("/donation/{donationId}")
    @Operation(summary = "List all recipient requests for a donation post")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestResponse>>> getRequestsForDonation(
            @PathVariable UUID donationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DonationRequestResponse> response = donationRequestService.getRequestsForDonation(donationId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Requests fetched successfully", response));
    }

    @GetMapping("/my-requests")
    @Operation(summary = "List requests submitted by authenticated recipient organization")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestResponse>>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        PagedResponse<DonationRequestResponse> response = donationRequestService.getMyRequests(authenticatedUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success("My requests fetched successfully", response));
    }
}
