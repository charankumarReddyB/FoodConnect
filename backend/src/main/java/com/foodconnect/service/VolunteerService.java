package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.VolunteerResponse;

import java.util.UUID;

public interface VolunteerService {
    VolunteerResponse getVolunteerByUserId(UUID userId);
    VolunteerResponse toggleAvailability(UUID userId, Boolean isAvailable);
    VolunteerResponse updateLocation(UUID userId, Double lat, Double lon);
    PagedResponse<VolunteerResponse> getAllVolunteers(Boolean isAvailable, int page, int size);
}
