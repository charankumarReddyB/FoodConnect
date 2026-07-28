package com.foodconnect.dto.response;

import com.foodconnect.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class VolunteerResponse {
    private Long id;
    private UserResponse user;
    private VehicleType vehicleType;
    private Boolean availability;
    private Double rating;
    private Integer completedDeliveries;
    private Double distanceKm;
}
