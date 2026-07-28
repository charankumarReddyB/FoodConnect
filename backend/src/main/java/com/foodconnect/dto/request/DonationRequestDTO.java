package com.foodconnect.dto.request;

import com.foodconnect.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationRequestDTO {
    private Long id;
    private Long donationId;
    private String foodName;
    private Long recipientId;
    private String recipientName;
    private String recipientPhone;
    private RequestStatus status;
    private LocalDateTime requestTime;
    private LocalDateTime approvalTime;
}
