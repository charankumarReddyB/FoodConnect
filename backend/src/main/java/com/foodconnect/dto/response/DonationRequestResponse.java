package com.foodconnect.dto.response;

import com.foodconnect.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DonationRequestResponse {
    private Long id;
    private DonationResponse donation;
    private UserResponse recipient;
    private RequestStatus status;
    private LocalDateTime requestTime;
    private LocalDateTime approvalTime;
}
