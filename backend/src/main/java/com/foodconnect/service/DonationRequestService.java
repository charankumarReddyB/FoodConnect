package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.enums.RequestStatus;

import java.util.UUID;

public interface DonationRequestService {
    DonationRequestResponse requestDonation(UUID donationId, UUID recipientUserId, Integer requestedServings, String notes);
    DonationRequestResponse respondToRequest(UUID requestId, UUID donorUserId, RequestStatus status);
    PagedResponse<DonationRequestResponse> getRequestsForDonation(UUID donationId, int page, int size);
    PagedResponse<DonationRequestResponse> getMyRequests(UUID recipientUserId, int page, int size);
}
