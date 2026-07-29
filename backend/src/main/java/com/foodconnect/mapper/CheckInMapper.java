package com.foodconnect.mapper;

import com.foodconnect.dto.response.CheckInResponse;
import com.foodconnect.dto.response.CheckInStatusResponse;
import com.foodconnect.entity.CheckIn;
import org.springframework.stereotype.Component;

@Component
public class CheckInMapper {

    public CheckInResponse toResponse(CheckIn checkIn) {
        if (checkIn == null) return null;

        return CheckInResponse.builder()
                .id(checkIn.getId())
                .userId(checkIn.getUser() != null ? checkIn.getUser().getId() : null)
                .userName(checkIn.getUser() != null ? checkIn.getUser().getFullName() : null)
                .userEmail(checkIn.getUser() != null ? checkIn.getUser().getEmail() : null)
                .userRole(checkIn.getUser() != null && checkIn.getUser().getRole() != null ? checkIn.getUser().getRole().name() : null)
                .eventId(checkIn.getEventId())
                .location(checkIn.getLocation())
                .notes(checkIn.getNotes())
                .status(checkIn.getStatus())
                .checkedInAt(checkIn.getCheckedInAt())
                .build();
    }

    public CheckInStatusResponse toStatusResponse(CheckIn checkIn, boolean isCheckedIn, String message) {
        if (!isCheckedIn || checkIn == null) {
            return CheckInStatusResponse.builder()
                    .checkedIn(false)
                    .message(message != null ? message : "Not checked in today")
                    .build();
        }

        return CheckInStatusResponse.builder()
                .checkedIn(true)
                .checkInId(checkIn.getId())
                .userId(checkIn.getUser() != null ? checkIn.getUser().getId() : null)
                .userName(checkIn.getUser() != null ? checkIn.getUser().getFullName() : null)
                .eventId(checkIn.getEventId())
                .location(checkIn.getLocation())
                .status(checkIn.getStatus())
                .checkedInAt(checkIn.getCheckedInAt())
                .message("Currently checked in")
                .build();
    }
}
