package com.foodconnect.dto.delivery;

import com.foodconnect.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private Long id;
    private Long donationId;
    private String foodName;
    private String pickupAddress;
    private Double pickupLat;
    private Double pickupLng;
    private Long volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveryTime;
    private DeliveryStatus status;
    private String currentLocation;
}
