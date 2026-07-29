package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.enums.DeliveryStatus;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Tag(name = "Deliveries", description = "Endpoints for volunteer food delivery logistics and status updates")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/claim/{donationId}")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Claim a donation for volunteer delivery")
    public ResponseEntity<ApiResponse<DeliveryResponse>> claimDelivery(@PathVariable UUID donationId) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DeliveryResponse response = deliveryService.claimDelivery(donationId, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery claimed successfully", response));
    }

    @PatchMapping("/{deliveryId}/status")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Update delivery status (EN_ROUTE_PICKUP, PICKED_UP, EN_ROUTE_DELIVERY, DELIVERED)")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @PathVariable UUID deliveryId,
            @RequestParam DeliveryStatus status,
            @RequestParam(required = false) String verificationCode) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        DeliveryResponse response = deliveryService.updateDeliveryStatus(deliveryId, authenticatedUserId, status, verificationCode);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated successfully", response));
    }

    @GetMapping("/donation/{donationId}")
    @Operation(summary = "Fetch delivery details by donation ID")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryByDonationId(@PathVariable UUID donationId) {
        DeliveryResponse response = deliveryService.getDeliveryByDonationId(donationId);
        return ResponseEntity.ok(ApiResponse.success("Delivery details retrieved", response));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Get deliveries claimed by authenticated volunteer")
    public ResponseEntity<ApiResponse<PagedResponse<DeliveryResponse>>> getMyDeliveries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        PagedResponse<DeliveryResponse> response = deliveryService.getMyDeliveries(authenticatedUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Deliveries retrieved", response));
    }
}
