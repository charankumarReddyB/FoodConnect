package com.foodconnect.service.impl;

import com.foodconnect.dto.request.VolunteerRegisterRequest;
import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.entity.User;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.mapper.VolunteerMapper;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.VolunteerRepository;
import com.foodconnect.response.PagedResponse;
import com.foodconnect.service.VolunteerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VolunteerServiceImpl implements VolunteerService {

    private final VolunteerRepository volunteerRepository;
    private final UserRepository userRepository;
    private final VolunteerMapper volunteerMapper;

    @Override
    @Transactional
    public VolunteerResponse registerVolunteer(Long userId, VolunteerRegisterRequest request) {
        if (volunteerRepository.existsByUserId(userId)) {
            throw new DuplicateResourceException("User is already registered as a volunteer.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Volunteer volunteer = Volunteer.builder()
                .user(user)
                .vehicleType(request.getVehicleType())
                .availability(request.getAvailability() != null ? request.getAvailability() : true)
                .rating(5.0)
                .completedDeliveries(0)
                .build();

        Volunteer saved = volunteerRepository.save(volunteer);
        return volunteerMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerResponse getVolunteerById(Long id) {
        Volunteer volunteer = volunteerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "id", id));
        return volunteerMapper.toResponse(volunteer);
    }

    @Override
    @Transactional(readOnly = true)
    public VolunteerResponse getVolunteerByUserId(Long userId) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "userId", userId));
        return volunteerMapper.toResponse(volunteer);
    }

    @Override
    @Transactional
    public VolunteerResponse updateAvailability(Long userId, boolean availability) {
        Volunteer volunteer = volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer", "userId", userId));
        volunteer.setAvailability(availability);
        Volunteer updated = volunteerRepository.save(volunteer);
        return volunteerMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<VolunteerResponse> getAvailableVolunteers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Volunteer> pageResult = volunteerRepository.findByAvailability(true, pageable);

        List<VolunteerResponse> content = pageResult.getContent().stream()
                .map(volunteerMapper::toResponse)
                .toList();

        return PagedResponse.<VolunteerResponse>builder()
                .content(content)
                .pageNumber(pageResult.getNumber())
                .pageSize(pageResult.getSize())
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }
}
