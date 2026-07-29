package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.CheckInRequest;
import com.foodconnect.dto.response.CheckInResponse;
import com.foodconnect.dto.response.CheckInStatusResponse;
import com.foodconnect.entity.ActivityLog;
import com.foodconnect.entity.CheckIn;
import com.foodconnect.entity.User;
import com.foodconnect.enums.CheckInStatus;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.mapper.CheckInMapper;
import com.foodconnect.repository.ActivityLogRepository;
import com.foodconnect.repository.CheckInRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.CheckInService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckInServiceImpl implements CheckInService {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CheckInMapper checkInMapper;

    @Override
    @Transactional
    public CheckInResponse checkIn(CheckInRequest request, UUID authenticatedUserId) {
        UUID targetUserId = (request != null && request.getUserId() != null) ? request.getUserId() : authenticatedUserId;

        log.info("Processing check-in request for user ID: {}", targetUserId);

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + targetUserId));

        OffsetDateTime startOfDay = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        Optional<CheckIn> existingCheckIn = checkInRepository
                .findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
                        targetUserId, startOfDay, endOfDay, CheckInStatus.CHECKED_IN);

        if (existingCheckIn.isPresent()) {
            log.warn("Duplicate check-in attempt by user ID: {}", targetUserId);
            throw new DuplicateResourceException("User is already checked in for today (" + LocalDate.now() + ")");
        }

        CheckIn checkIn = CheckIn.builder()
                .user(user)
                .eventId(request != null ? request.getEventId() : null)
                .location(request != null ? request.getLocation() : null)
                .notes(request != null ? request.getNotes() : null)
                .status(CheckInStatus.CHECKED_IN)
                .checkedInAt(OffsetDateTime.now(ZoneOffset.UTC))
                .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
                .build();

        CheckIn savedCheckIn = checkInRepository.save(checkIn);

        ActivityLog logEntry = ActivityLog.builder()
                .user(user)
                .action("USER_CHECKIN")
                .details("Check-in completed successfully. Record ID: " + savedCheckIn.getId())
                .timestamp(java.time.LocalDateTime.now())
                .build();
        activityLogRepository.save(logEntry);

        log.info("Check-in successfully recorded for user: {} (CheckIn ID: {})", user.getEmail(), savedCheckIn.getId());

        return checkInMapper.toResponse(savedCheckIn);
    }

    @Override
    @Transactional(readOnly = true)
    public CheckInStatusResponse getUserCheckInStatus(UUID userId) {
        log.info("Checking check-in status for user ID: {}", userId);

        OffsetDateTime startOfDay = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        Optional<CheckIn> activeCheckIn = checkInRepository
                .findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
                        userId, startOfDay, endOfDay, CheckInStatus.CHECKED_IN);

        return activeCheckIn
                .map(checkIn -> checkInMapper.toStatusResponse(checkIn, true, "Checked in today at " + checkIn.getCheckedInAt()))
                .orElseGet(() -> checkInMapper.toStatusResponse(null, false, "Not checked in today"));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<CheckInResponse> getAllCheckIns(String search, CheckInStatus status, int page, int size) {
        log.info("Fetching all check-ins. Filter search='{}', status='{}', page={}, size={}", search, status, page, size);

        Page<CheckIn> checkInPage = checkInRepository.searchCheckIns(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                status,
                PageRequest.of(page, size));

        List<CheckInResponse> content = checkInPage.getContent().stream()
                .map(checkInMapper::toResponse)
                .toList();

        return new PagedResponse<>(
                content,
                checkInPage.getNumber(),
                checkInPage.getSize(),
                checkInPage.getTotalElements(),
                checkInPage.getTotalPages(),
                checkInPage.isLast()
        );
    }

    @Override
    @Transactional
    public CheckInResponse adminCheckInUser(UUID userId, CheckInRequest request) {
        log.info("Admin manual check-in for target user ID: {}", userId);
        CheckInRequest adminRequest = request != null ? request : new CheckInRequest();
        adminRequest.setUserId(userId);
        return checkIn(adminRequest, userId);
    }

    @Override
    @Transactional
    public CheckInResponse adminUndoCheckIn(UUID checkInId) {
        log.info("Admin undoing check-in ID: {}", checkInId);

        CheckIn checkIn = checkInRepository.findById(checkInId)
                .orElseThrow(() -> new ResourceNotFoundException("Check-in record not found with ID: " + checkInId));

        checkIn.setStatus(CheckInStatus.CANCELLED);
        CheckIn updated = checkInRepository.save(checkIn);

        ActivityLog logEntry = ActivityLog.builder()
                .user(checkIn.getUser())
                .action("ADMIN_UNDO_CHECKIN")
                .details("Check-in ID " + checkInId + " marked as CANCELLED by Admin")
                .timestamp(java.time.LocalDateTime.now())
                .build();
        activityLogRepository.save(logEntry);

        log.info("Check-in ID {} status updated to CANCELLED", checkInId);

        return checkInMapper.toResponse(updated);
    }
}
