package com.foodconnect.service;

import com.foodconnect.dto.request.DeliveryStatusUpdateRequest;
import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.response.PagedResponse;

public interface DeliveryService {
    DeliveryResponse assignDelivery(Long donationId, Long volunteerUserId);
    DeliveryResponse acceptDelivery(Long deliveryId, Long volunteerUserId);
    DeliveryResponse updateDeliveryStatus(Long deliveryId, Long volunteerUserId, DeliveryStatusUpdateRequest request);
    DeliveryResponse completeDelivery(Long deliveryId, Long recipientUserId);
    DeliveryResponse getDeliveryByDonationId(Long donationId);
    PagedResponse<DeliveryResponse> getMyDeliveries(Long volunteerUserId, int page, int size);
}
