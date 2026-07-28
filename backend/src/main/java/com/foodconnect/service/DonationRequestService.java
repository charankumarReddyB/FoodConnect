package com.foodconnect.service;

import com.foodconnect.dto.request.DonationRequestCreateDto;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.response.PagedResponse;

import java.util.List;

public interface DonationRequestService {
    DonationRequestResponse createRequest(Long recipientId, DonationRequestCreateDto dto);
    DonationRequestResponse acceptRequest(Long requestId, Long donorId);
    DonationRequestResponse rejectRequest(Long requestId, Long donorId);
    DonationRequestResponse cancelRequest(Long requestId, Long recipientId);
    List<DonationRequestResponse> getRequestsForDonation(Long donationId, Long donorId);
    PagedResponse<DonationRequestResponse> getMyRequests(Long recipientId, int page, int size);
}
