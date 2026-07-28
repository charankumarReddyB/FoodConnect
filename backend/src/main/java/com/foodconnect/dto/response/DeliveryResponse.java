package com.foodconnect.dto.response;

import com.foodconnect.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryResponse {
    private Long id;
    private DonationResponse donation;
    private VolunteerResponse volunteer;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveryTime;
    private DeliveryStatus status;
    private String currentLocation;
}
