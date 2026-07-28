package com.foodconnect.dto.request;

import com.foodconnect.enums.VehicleType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VolunteerRegisterRequest {
    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;
    
    private Boolean availability;
}
