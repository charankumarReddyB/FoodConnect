package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Endpoints for volunteer profiles, availability, and active tracking")
public class VolunteerController {

    private final VolunteerService volunteerService;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Get current authenticated volunteer profile")
    public ResponseEntity<ApiResponse<VolunteerResponse>> getMyVolunteerProfile() {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        VolunteerResponse response = volunteerService.getVolunteerByUserId(authenticatedUserId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer profile retrieved", response));
    }

    @PatchMapping("/availability")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Toggle volunteer availability for delivery assignments")
    public ResponseEntity<ApiResponse<VolunteerResponse>> toggleAvailability(@RequestParam(required = false) Boolean isAvailable) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        VolunteerResponse response = volunteerService.toggleAvailability(authenticatedUserId, isAvailable);
        return ResponseEntity.ok(ApiResponse.success("Volunteer availability updated", response));
    }

    @PostMapping("/location")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Update current volunteer GPS coordinates")
    public ResponseEntity<ApiResponse<VolunteerResponse>> updateLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        VolunteerResponse response = volunteerService.updateLocation(authenticatedUserId, latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Volunteer location updated", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: List all registered volunteers")
    public ResponseEntity<ApiResponse<PagedResponse<VolunteerResponse>>> getAllVolunteers(
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<VolunteerResponse> response = volunteerService.getAllVolunteers(isAvailable, page, size);
        return ResponseEntity.ok(ApiResponse.success("Volunteers fetched successfully", response));
    }
}
