package com.foodconnect.mapper;

import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.DonationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RequestMapper {

    private final DonationMapper donationMapper;
    private final UserMapper userMapper;

    public DonationRequestResponse toResponse(DonationRequest request) {
        if (request == null) return null;

        return DonationRequestResponse.builder()
                .id(request.getId())
                .donation(donationMapper.toResponse(request.getDonation()))
                .recipient(userMapper.toResponse(request.getRecipient()))
                .status(request.getStatus())
                .requestTime(request.getRequestTime())
                .approvalTime(request.getApprovalTime())
                .build();
    }
}
