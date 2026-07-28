package com.foodconnect.service;

import com.foodconnect.dto.request.VolunteerRegisterRequest;
import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.response.PagedResponse;

public interface VolunteerService {
    VolunteerResponse registerVolunteer(Long userId, VolunteerRegisterRequest request);
    VolunteerResponse getVolunteerById(Long id);
    VolunteerResponse getVolunteerByUserId(Long userId);
    VolunteerResponse updateAvailability(Long userId, boolean availability);
    PagedResponse<VolunteerResponse> getAvailableVolunteers(int page, int size);
}
