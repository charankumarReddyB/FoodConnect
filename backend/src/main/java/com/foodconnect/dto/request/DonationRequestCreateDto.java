package com.foodconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DonationRequestCreateDto {
    @NotNull(message = "Donation ID is required")
    private Long donationId;
}
