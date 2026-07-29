package com.foodconnect.dto.response;

import com.foodconnect.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private UUID id;
    private UUID donationId;
    private String donationTitle;
    private String pickupAddress;
    private UUID volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private UUID requestId;
    private DeliveryStatus status;
    private OffsetDateTime pickupTime;
    private OffsetDateTime deliveryTime;
    private String pickupVerificationCode;
    private String deliveryVerificationCode;
    private String notes;
    private OffsetDateTime createdAt;
}
