package com.foodconnect.mapper;

import com.foodconnect.dto.response.VolunteerResponse;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.util.DistanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VolunteerMapper {

    private final UserMapper userMapper;

    public VolunteerResponse toResponse(Volunteer volunteer) {
        return toResponse(volunteer, null, null);
    }

    public VolunteerResponse toResponse(Volunteer volunteer, Double userLat, Double userLon) {
        if (volunteer == null) return null;

        Double distance = null;
        if (userLat != null && userLon != null && volunteer.getUser() != null 
                && volunteer.getUser().getLatitude() != null && volunteer.getUser().getLongitude() != null) {
            distance = DistanceCalculator.calculateDistanceInKm(userLat, userLon, 
                    volunteer.getUser().getLatitude(), volunteer.getUser().getLongitude());
        }

        return VolunteerResponse.builder()
                .id(volunteer.getId())
                .user(userMapper.toResponse(volunteer.getUser()))
                .vehicleType(volunteer.getVehicleType())
                .availability(volunteer.getAvailability())
                .rating(volunteer.getRating())
                .completedDeliveries(volunteer.getCompletedDeliveries())
                .distanceKm(distance)
                .build();
    }
}
