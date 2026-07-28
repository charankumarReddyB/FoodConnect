package com.foodconnect.dto.volunteer;

import com.foodconnect.enums.VehicleType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolunteerRegisterRequest {
    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;
}
