package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.volunteer.VolunteerDTO;
import com.foodconnect.dto.volunteer.VolunteerRegisterRequest;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.VolunteerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/volunteers")
@RequiredArgsConstructor
@Tag(name = "Volunteers", description = "Volunteer registration and availability management endpoints")
public class VolunteerController {

    private final VolunteerService volunteerService;

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Register user as a volunteer")
    public ResponseEntity<ApiResponse<VolunteerDTO>> registerVolunteer(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody VolunteerRegisterRequest request) {
        VolunteerDTO response = volunteerService.registerVolunteer(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Volunteer registered successfully", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Get volunteer profile")
    public ResponseEntity<ApiResponse<VolunteerDTO>> getVolunteerProfile(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        VolunteerDTO response = volunteerService.getVolunteerProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Volunteer profile retrieved", response));
    }

    @PostMapping("/availability")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    @Operation(summary = "Toggle volunteer availability status")
    public ResponseEntity<ApiResponse<VolunteerDTO>> toggleAvailability(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam Boolean availability) {
        VolunteerDTO response = volunteerService.toggleAvailability(currentUser.getId(), availability);
        return ResponseEntity.ok(ApiResponse.success("Availability updated", response));
    }
}
