package com.foodconnect.mapper;

import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.entity.Volunteer;
import org.springframework.stereotype.Component;

@Component
public class VolunteerMapper {

    public VolunteerResponse toResponse(Volunteer volunteer) {
        if (volunteer == null) return null;

        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .userId(volunteer.getUser() != null ? volunteer.getUser().getId() : null)
                .fullName(volunteer.getUser() != null ? volunteer.getUser().getFullName() : null)
                .email(volunteer.getUser() != null ? volunteer.getUser().getEmail() : null)
                .phone(volunteer.getUser() != null ? volunteer.getUser().getPhone() : null)
                .vehicleType(volunteer.getVehicleType())
                .licenseNumber(volunteer.getLicenseNumber())
                .isAvailable(volunteer.getIsAvailable())
                .currentLatitude(volunteer.getCurrentLatitude())
                .currentLongitude(volunteer.getCurrentLongitude())
                .rating(volunteer.getRating())
                .completedDeliveriesCount(volunteer.getCompletedDeliveriesCount())
                .createdAt(volunteer.getCreatedAt())
                .build();
    }
}
