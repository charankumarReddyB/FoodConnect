package com.foodconnect.controller;

import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.NotificationResponse;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app notifications management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get current user's notifications")
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        PagedResponse<NotificationResponse> response = notificationService.getUserNotifications(authenticatedUserId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", response));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID id) {
        UUID authenticatedUserId = SecurityUtils.getCurrentUserId();
        notificationService.markAsRead(id, authenticatedUserId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }
}
