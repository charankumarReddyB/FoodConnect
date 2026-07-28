package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.entity.ActivityLog;
import com.foodconnect.repository.*;
import com.foodconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final DonationRequestRepository requestRepository;
    private final VolunteerRepository volunteerRepository;
    private final DeliveryRepository deliveryRepository;
    private final OrganizationRepository organizationRepository;
    private final ActivityLogRepository activityLogRepository;

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDonations", donationRepository.count());
        stats.put("totalRequests", requestRepository.count());
        stats.put("totalVolunteers", volunteerRepository.count());
        stats.put("totalDeliveries", deliveryRepository.count());
        stats.put("totalOrganizations", organizationRepository.count());
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ActivityLog> getAllActivityLogs(int page, int size) {
        Page<ActivityLog> logPage = activityLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, size));
        return new PagedResponse<>(
                logPage.getContent(),
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages(),
                logPage.isLast()
        );
    }
}
