package com.foodconnect.dto.response;

import com.foodconnect.enums.RequestStatus;
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
public class DonationRequestResponse {
    private UUID id;
    private UUID donationId;
    private String donationTitle;
    private UUID recipientId;
    private String recipientOrganizationName;
    private RequestStatus status;
    private Integer requestedServings;
    private String notes;
    private OffsetDateTime requestTime;
    private OffsetDateTime responseTime;
    private OffsetDateTime createdAt;
}
