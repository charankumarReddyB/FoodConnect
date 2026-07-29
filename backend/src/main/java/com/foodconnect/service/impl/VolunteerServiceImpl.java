package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.repository.VolunteerRepository;
import com.foodconnect.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerRepository volunteerRepository;

    @Override
    @Transactional(readOnly = true)
    public VolunteerResponse getVolunteerByUserId(UUID userId) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + userId));
        return mapToResponse(volunteer);
    }

    @Override
    @Transactional
    public VolunteerResponse toggleAvailability(UUID userId, Boolean isAvailable) {
        log.info("Toggling availability to {} for volunteer user ID {}", isAvailable, userId);

        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + userId));

        volunteer.setIsAvailable(isAvailable != null ? isAvailable : !volunteer.getIsAvailable());
        Volunteer updated = volunteerRepository.save(volunteer);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public VolunteerResponse updateLocation(UUID userId, Double lat, Double lon) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user ID: " + userId));

        volunteer.setCurrentLatitude(lat);
        volunteer.setCurrentLongitude(lon);
        Volunteer updated = volunteerRepository.save(volunteer);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VolunteerResponse> getAllVolunteers(Boolean isAvailable, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Volunteer> pageResult;

        if (isAvailable != null) {
            pageResult = volunteerRepository.findByIsAvailable(isAvailable, pageable);
        } else {
            pageResult = volunteerRepository.findAll(pageable);
        }

        List<VolunteerResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PagedResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast()
        );
    }

    private VolunteerResponse mapToResponse(Volunteer v) {
        return VolunteerResponse.builder()
                .id(v.getId())
                .userId(v.getUser() != null ? v.getUser().getId() : null)
                .fullName(v.getUser() != null ? v.getUser().getFullName() : null)
                .email(v.getUser() != null ? v.getUser().getEmail() : null)
                .phone(v.getUser() != null ? v.getUser().getPhone() : null)
                .vehicleType(v.getVehicleType())
                .licenseNumber(v.getLicenseNumber())
                .isAvailable(v.getIsAvailable())
                .currentLatitude(v.getCurrentLatitude())
                .currentLongitude(v.getCurrentLongitude())
                .rating(v.getRating())
                .completedDeliveriesCount(v.getCompletedDeliveriesCount())
                .createdAt(v.getCreatedAt())
                .build();
    }
}
