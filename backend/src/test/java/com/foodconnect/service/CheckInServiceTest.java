package com.foodconnect.service;

import com.foodconnect.dto.request.CheckInRequest;
import com.foodconnect.dto.response.CheckInResponse;
import com.foodconnect.dto.response.CheckInStatusResponse;
import com.foodconnect.entity.CheckIn;
import com.foodconnect.entity.User;
import com.foodconnect.enums.CheckInStatus;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.mapper.CheckInMapper;
import com.foodconnect.repository.ActivityLogRepository;
import com.foodconnect.repository.CheckInRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.impl.CheckInServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CheckInServiceTest {

    @Mock
    private CheckInRepository checkInRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private CheckInMapper checkInMapper;

    @InjectMocks
    private CheckInServiceImpl checkInService;

    private UUID userId;
    private User mockUser;
    private CheckIn mockCheckIn;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        mockUser = User.builder()
                .id(userId)
                .fullName("Test User")
                .email("test@foodconnect.org")
                .role(UserRole.VOLUNTEER)
                .isActive(true)
                .build();

        mockCheckIn = CheckIn.builder()
                .id(UUID.randomUUID())
                .user(mockUser)
                .status(CheckInStatus.CHECKED_IN)
                .checkedInAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Successfully perform user check-in when not already checked in today")
    void testCheckIn_Success() {
        CheckInRequest request = CheckInRequest.builder()
                .location("Community Kitchen A")
                .eventId("EVT-101")
                .build();

        CheckInResponse expectedResponse = CheckInResponse.builder()
                .id(mockCheckIn.getId())
                .userId(userId)
                .userName("Test User")
                .status(CheckInStatus.CHECKED_IN)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(checkInRepository.findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
                eq(userId), any(), any(), eq(CheckInStatus.CHECKED_IN))).thenReturn(Optional.empty());
        when(checkInRepository.save(any(CheckIn.class))).thenReturn(mockCheckIn);
        when(checkInMapper.toResponse(mockCheckIn)).thenReturn(expectedResponse);

        CheckInResponse result = checkInService.checkIn(request, userId);

        assertNotNull(result);
        assertEquals(CheckInStatus.CHECKED_IN, result.getStatus());
        assertEquals("Test User", result.getUserName());
        verify(checkInRepository, times(1)).save(any(CheckIn.class));
        verify(activityLogRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Throw DuplicateResourceException when user tries to check-in twice on the same day")
    void testCheckIn_Duplicate_ThrowsException() {
        CheckInRequest request = CheckInRequest.builder().location("Center B").build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(checkInRepository.findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
                eq(userId), any(), any(), eq(CheckInStatus.CHECKED_IN))).thenReturn(Optional.of(mockCheckIn));

        assertThrows(DuplicateResourceException.class, () -> checkInService.checkIn(request, userId));
        verify(checkInRepository, never()).save(any(CheckIn.class));
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when checking in for a non-existent user")
    void testCheckIn_UserNotFound_ThrowsException() {
        UUID nonExistentUserId = UUID.randomUUID();
        when(userRepository.findById(nonExistentUserId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> checkInService.checkIn(new CheckInRequest(), nonExistentUserId));
    }

    @Test
    @DisplayName("GetUserCheckInStatus returns checkedIn=true when active check-in exists")
    void testGetUserCheckInStatus_Active() {
        CheckInStatusResponse expectedStatus = CheckInStatusResponse.builder()
                .checkedIn(true)
                .checkInId(mockCheckIn.getId())
                .userId(userId)
                .status(CheckInStatus.CHECKED_IN)
                .message("Currently checked in")
                .build();

        when(checkInRepository.findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
                eq(userId), any(), any(), eq(CheckInStatus.CHECKED_IN))).thenReturn(Optional.of(mockCheckIn));
        when(checkInMapper.toStatusResponse(eq(mockCheckIn), eq(true), anyString())).thenReturn(expectedStatus);

        CheckInStatusResponse result = checkInService.getUserCheckInStatus(userId);

        assertTrue(result.getCheckedIn());
        assertEquals("Currently checked in", result.getMessage());
    }
}
