package com.foodconnect.dto.response;

import com.foodconnect.enums.CheckInStatus;
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
public class CheckInStatusResponse {
    private Boolean checkedIn;
    private UUID checkInId;
    private UUID userId;
    private String userName;
    private String eventId;
    private String location;
    private CheckInStatus status;
    private OffsetDateTime checkedInAt;
    private String message;
}
