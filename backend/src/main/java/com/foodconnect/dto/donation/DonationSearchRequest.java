package com.foodconnect.dto.donation;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DonationSearchRequest {

    @NotNull(message = "Latitude is required for nearby search")
    private Double latitude;

    @NotNull(message = "Longitude is required for nearby search")
    private Double longitude;

    private Double radiusKm = 10.0;
}
