package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.organization.OrganizationDTO;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Endpoints for registering and managing NGOs, orphanages, and shelters")
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @Operation(summary = "Register an organization (NGO / Orphanage / Old Age Home / Shelter)")
    public ResponseEntity<ApiResponse<OrganizationDTO>> registerOrganization(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody OrganizationDTO dto) {
        Long userId = currentUser != null ? currentUser.getId() : null;
        OrganizationDTO response = organizationService.registerOrganization(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Organization registered successfully", response));
    }

    @GetMapping
    @Operation(summary = "List organizations (optional verified filter)")
    public ResponseEntity<ApiResponse<PagedResponse<OrganizationDTO>>> getOrganizations(
            @RequestParam(required = false) Boolean verified,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<OrganizationDTO> response = organizationService.getOrganizations(verified, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Organizations fetched", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get organization details by ID")
    public ResponseEntity<ApiResponse<OrganizationDTO>> getOrganizationById(@PathVariable Long id) {
        OrganizationDTO response = organizationService.getOrganizationById(id);
        return ResponseEntity.ok(ApiResponse.success("Organization fetched", response));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify an organization (Admin only)")
    public ResponseEntity<ApiResponse<OrganizationDTO>> verifyOrganization(@PathVariable Long id) {
        OrganizationDTO response = organizationService.verifyOrganization(id);
        return ResponseEntity.ok(ApiResponse.success("Organization verified successfully", response));
    }
}
