package com.foodconnect.dto.delivery;

import com.foodconnect.enums.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeliveryStatusUpdateRequest {
    @NotNull(message = "Delivery status is required")
    private DeliveryStatus status;
    private String currentLocation;
}
