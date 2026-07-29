package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.CheckInRequest;
import com.foodconnect.dto.response.CheckInResponse;
import com.foodconnect.dto.response.CheckInStatusResponse;
import com.foodconnect.enums.CheckInStatus;

import java.util.UUID;

public interface CheckInService {
    CheckInResponse checkIn(CheckInRequest request, UUID authenticatedUserId);
    CheckInStatusResponse getUserCheckInStatus(UUID userId);
    PagedResponse<CheckInResponse> getAllCheckIns(String search, CheckInStatus status, int page, int size);
    CheckInResponse adminCheckInUser(UUID userId, CheckInRequest request);
    CheckInResponse adminUndoCheckIn(UUID checkInId);
}
