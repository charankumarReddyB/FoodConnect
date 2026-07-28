package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.delivery.DeliveryResponse;
import com.foodconnect.dto.delivery.DeliveryStatusUpdateRequest;
import com.foodconnect.enums.DeliveryStatus;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Tag(name = "Deliveries", description = "Endpoints for claiming and updating food donation deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/claim/{donationId}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Volunteer claims/accepts a donation delivery")
    public ResponseEntity<ApiResponse<DeliveryResponse>> claimDelivery(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long donationId) {
        DeliveryResponse response = deliveryService.claimDelivery(currentUser.getId(), donationId);
        return ResponseEntity.ok(ApiResponse.success("Delivery claimed successfully", response));
    }

    @PutMapping("/{deliveryId}/status")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Update delivery status (ASSIGNED -> PICKED_UP -> DELIVERED)")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long deliveryId,
            @Valid @RequestBody DeliveryStatusUpdateRequest request) {
        DeliveryResponse response = deliveryService.updateDeliveryStatus(currentUser.getId(), deliveryId, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated", response));
    }

    @GetMapping("/{deliveryId}")
    @Operation(summary = "Get delivery details by ID")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(@PathVariable Long deliveryId) {
        DeliveryResponse response = deliveryService.getDeliveryById(deliveryId);
        return ResponseEntity.ok(ApiResponse.success("Delivery details fetched", response));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Get deliveries claimed by current volunteer")
    public ResponseEntity<ApiResponse<PagedResponse<DeliveryResponse>>> getMyDeliveries(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DeliveryResponse> response = deliveryService.getDeliveriesByVolunteer(currentUser.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Volunteer deliveries fetched", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List deliveries by status (Admin)")
    public ResponseEntity<ApiResponse<PagedResponse<DeliveryResponse>>> getDeliveriesByStatus(
            @RequestParam DeliveryStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<DeliveryResponse> response = deliveryService.getDeliveriesByStatus(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Deliveries fetched", response));
    }
}
