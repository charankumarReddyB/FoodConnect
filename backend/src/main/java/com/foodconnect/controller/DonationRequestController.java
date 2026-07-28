package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.DonationRequestDTO;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DonationRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
@Tag(name = "Donation Requests", description = "Endpoints for recipients requesting donations and donors approving/rejecting")
public class DonationRequestController {

    private final DonationRequestService requestService;

    @PostMapping("/donations/{donationId}")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    @Operation(summary = "Submit a request for a food donation")
    public ResponseEntity<ApiResponse<DonationRequestDTO>> createRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long donationId) {
        DonationRequestDTO response = requestService.createRequest(currentUser.getId(), donationId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donation request submitted successfully", response));
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Approve a donation request")
    public ResponseEntity<ApiResponse<DonationRequestDTO>> approveRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId) {
        DonationRequestDTO response = requestService.approveRequest(currentUser.getId(), requestId);
        return ResponseEntity.ok(ApiResponse.success("Request approved successfully", response));
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    @Operation(summary = "Reject a donation request")
    public ResponseEntity<ApiResponse<DonationRequestDTO>> rejectRequest(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long requestId) {
        DonationRequestDTO response = requestService.rejectRequest(currentUser.getId(), requestId);
        return ResponseEntity.ok(ApiResponse.success("Request rejected successfully", response));
    }

    @GetMapping("/donations/{donationId}")
    @Operation(summary = "Get all requests for a specific donation")
    public ResponseEntity<ApiResponse<List<DonationRequestDTO>>> getRequestsByDonation(@PathVariable Long donationId) {
        List<DonationRequestDTO> response = requestService.getRequestsByDonation(donationId);
        return ResponseEntity.ok(ApiResponse.success("Requests fetched successfully", response));
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('RECIPIENT', 'ADMIN')")
    @Operation(summary = "Get current recipient's requested donations")
    public ResponseEntity<ApiResponse<PagedResponse<DonationRequestDTO>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DonationRequestDTO> response = requestService.getRequestsByRecipient(
                currentUser.getId(), PageRequest.of(page, size, Sort.by("requestTime").descending()));
        return ResponseEntity.ok(ApiResponse.success("Recipient requests fetched", response));
    }
}
