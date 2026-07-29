package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.CheckInRequest;
import com.foodconnect.dto.response.CheckInResponse;
import com.foodconnect.dto.response.CheckInStatusResponse;
import com.foodconnect.enums.CheckInStatus;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.CheckInService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "CheckIn", description = "Check-in management endpoints for users and administrators")
public class CheckInController {

    private final CheckInService checkInService;

    @PostMapping("/checkin")
    @Operation(summary = "Perform user check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(@RequestBody(required = false) CheckInRequest request) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        CheckInResponse response = checkInService.checkIn(request, authenticatedUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Check-in recorded successfully", response));
    }

    @GetMapping("/checkin/status")
    @Operation(summary = "Fetch check-in status for current authenticated user")
    public ResponseEntity<ApiResponse<CheckInStatusResponse>> getCheckInStatus() {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        CheckInStatusResponse response = checkInService.getUserCheckInStatus(authenticatedUserId);
        return ResponseEntity.ok(ApiResponse.success("Check-in status retrieved", response));
    }

    @GetMapping("/admin/checkins")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: List all check-in records with search and status filters")
    public ResponseEntity<ApiResponse<PagedResponse<CheckInResponse>>> getAllCheckIns(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CheckInStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<CheckInResponse> response = checkInService.getAllCheckIns(search, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Check-in records retrieved", response));
    }

    @PostMapping("/admin/checkins/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Manually mark a user as checked in")
    public ResponseEntity<ApiResponse<CheckInResponse>> adminCheckInUser(
            @PathVariable UUID userId,
            @RequestBody(required = false) CheckInRequest request) {
        CheckInResponse response = checkInService.adminCheckInUser(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User marked as checked in successfully", response));
    }

    @DeleteMapping("/admin/checkins/{checkInId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Undo check-in for a user")
    public ResponseEntity<ApiResponse<CheckInResponse>> adminUndoCheckIn(@PathVariable UUID checkInId) {
        CheckInResponse response = checkInService.adminUndoCheckIn(checkInId);
        return ResponseEntity.ok(ApiResponse.success("Check-in undone successfully", response));
    }
}
