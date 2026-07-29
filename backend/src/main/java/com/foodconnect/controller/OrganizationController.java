package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.OrganizationResponse;
import com.foodconnect.enums.OrganizationType;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Endpoints for NGO, Shelter, and Orphanage profile management")
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated organization profile")
    public ResponseEntity<ApiResponse<OrganizationResponse>> getMyOrganizationProfile() {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        OrganizationResponse response = organizationService.getOrganizationByUserId(authenticatedUserId);
        return ResponseEntity.ok(ApiResponse.success("Organization profile retrieved", response));
    }

    @PatchMapping("/capacity")
    @Operation(summary = "Update organization serving capacity")
    public ResponseEntity<ApiResponse<OrganizationResponse>> updateCapacity(@RequestParam Integer capacityServings) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        OrganizationResponse response = organizationService.updateOrganizationCapacity(authenticatedUserId, capacityServings);
        return ResponseEntity.ok(ApiResponse.success("Capacity updated successfully", response));
    }

    @GetMapping
    @Operation(summary = "List registered organizations (optional type & verification filters)")
    public ResponseEntity<ApiResponse<PagedResponse<OrganizationResponse>>> getOrganizations(
            @RequestParam(required = false) OrganizationType orgType,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OrganizationResponse> response = organizationService.getOrganizations(orgType, isVerified, page, size);
        return ResponseEntity.ok(ApiResponse.success("Organizations retrieved successfully", response));
    }

    @PatchMapping("/{organizationId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Verify an organization")
    public ResponseEntity<ApiResponse<OrganizationResponse>> verifyOrganization(
            @PathVariable UUID organizationId,
            @RequestParam(defaultValue = "true") Boolean isVerified) {
        OrganizationResponse response = organizationService.verifyOrganization(organizationId, isVerified);
        return ResponseEntity.ok(ApiResponse.success("Organization verification status updated", response));
    }
}
