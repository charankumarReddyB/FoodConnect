package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.entity.ActivityLog;
import com.foodconnect.repository.*;
import com.foodconnect.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private DonationRequestRepository requestRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    @Test
    @DisplayName("Get Dashboard Stats - Aggregates counts")
    void getDashboardStats_ReturnsCountsMap() {
        when(userRepository.count()).thenReturn(100L);
        when(donationRepository.count()).thenReturn(50L);
        when(requestRepository.count()).thenReturn(30L);
        when(volunteerRepository.count()).thenReturn(20L);
        when(deliveryRepository.count()).thenReturn(25L);
        when(organizationRepository.count()).thenReturn(10L);

        Map<String, Object> stats = adminService.getDashboardStats();

        assertThat(stats).isNotNull();
        assertThat(stats.get("totalUsers")).isEqualTo(100L);
        assertThat(stats.get("totalDonations")).isEqualTo(50L);
        assertThat(stats.get("totalRequests")).isEqualTo(30L);
    }

    @Test
    @DisplayName("Get All Activity Logs - Paginated Response")
    void getAllActivityLogs_ReturnsPagedResponse() {
        ActivityLog logItem = ActivityLog.builder()
                .id(1L)
                .action("USER_LOGIN")
                .details("Logged in via Google OAuth")
                .build();

        Page<ActivityLog> logPage = new PageImpl<>(List.of(logItem));
        when(activityLogRepository.findAllByOrderByTimestampDesc(any(Pageable.class))).thenReturn(logPage);

        PagedResponse<ActivityLog> response = adminService.getAllActivityLogs(0, 10);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getAction()).isEqualTo("USER_LOGIN");
    }
}
