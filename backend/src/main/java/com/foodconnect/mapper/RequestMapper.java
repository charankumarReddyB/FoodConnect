package com.foodconnect.mapper;

import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.DonationRequest;
import org.springframework.stereotype.Component;

@Component
public class RequestMapper {

    public DonationRequestResponse toResponse(DonationRequest request) {
        if (request == null) return null;

        return DonationRequestResponse.builder()
                .id(request.getId())
                .donationId(request.getDonation() != null ? request.getDonation().getId() : null)
                .donationTitle(request.getDonation() != null ? request.getDonation().getTitle() : null)
                .recipientId(request.getRecipient() != null ? request.getRecipient().getId() : null)
                .recipientOrganizationName(request.getRecipient() != null ? request.getRecipient().getOrganizationName() : null)
                .status(request.getStatus())
                .requestedServings(request.getRequestedServings())
                .notes(request.getNotes())
                .requestTime(request.getRequestTime())
                .responseTime(request.getResponseTime())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
