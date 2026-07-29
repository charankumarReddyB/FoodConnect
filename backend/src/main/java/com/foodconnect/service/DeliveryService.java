package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.enums.DeliveryStatus;

import java.util.UUID;

public interface DeliveryService {
    DeliveryResponse claimDelivery(UUID donationId, UUID volunteerUserId);
    DeliveryResponse updateDeliveryStatus(UUID deliveryId, UUID volunteerUserId, DeliveryStatus status, String verificationCode);
    DeliveryResponse getDeliveryByDonationId(UUID donationId);
    PagedResponse<DeliveryResponse> getMyDeliveries(UUID volunteerUserId, int page, int size);
}
