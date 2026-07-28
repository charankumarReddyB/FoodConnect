package com.foodconnect.controller;

import com.foodconnect.dto.auth.UserProfileResponse;
import com.foodconnect.dto.common.ApiResponse;
import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.enums.RoleName;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.AdminService;
import com.foodconnect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Administration endpoints for platform statistics, user management, and audit logs")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/stats")
    @Operation(summary = "Get platform dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered users (optional role filter)")
    public ResponseEntity<ApiResponse<PagedResponse<UserProfileResponse>>> getAllUsers(
            @RequestParam(required = false) RoleName role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<com.foodconnect.entity.User> userPage;
        if (role != null) {
            userPage = userRepository.findByRole_Name(role, PageRequest.of(page, size));
        } else {
            userPage = userRepository.findAll(PageRequest.of(page, size));
        }

        List<UserProfileResponse> content = userPage.getContent().stream().map(userMapper::toProfileResponse).toList();
        PagedResponse<UserProfileResponse> response = new PagedResponse<>(content, userPage.getNumber(), userPage.getSize(), userPage.getTotalElements(), userPage.getTotalPages(), userPage.isLast());

        return ResponseEntity.ok(ApiResponse.success("Users retrieved", response));
    }

    @PutMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(
            @PathVariable Long userId,
            @RequestParam Boolean active) {
        userService.toggleUserStatus(userId, active);
        return ResponseEntity.ok(ApiResponse.success("User active status updated"));
    }

    @GetMapping("/logs")
    @Operation(summary = "View platform activity audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<?>>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<?> logs = adminService.getAllActivityLogs(page, size);
        return ResponseEntity.ok(ApiResponse.success("Activity logs retrieved", logs));
    }
}
