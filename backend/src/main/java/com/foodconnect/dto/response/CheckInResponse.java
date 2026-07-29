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
public class CheckInResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String eventId;
    private String location;
    private String notes;
    private CheckInStatus status;
    private OffsetDateTime checkedInAt;
}
