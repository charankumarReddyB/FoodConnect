package com.foodconnect.mapper;

import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.entity.Delivery;
import org.springframework.stereotype.Component;

@Component
public class DeliveryMapper {

    public DeliveryResponse toResponse(Delivery d) {
        if (d == null) return null;

        return DeliveryResponse.builder()
                .id(d.getId())
                .donationId(d.getDonation() != null ? d.getDonation().getId() : null)
                .donationTitle(d.getDonation() != null ? d.getDonation().getTitle() : null)
                .pickupAddress(d.getDonation() != null ? d.getDonation().getPickupAddress() : null)
                .volunteerId(d.getVolunteer() != null ? d.getVolunteer().getId() : null)
                .volunteerName(d.getVolunteer() != null && d.getVolunteer().getUser() != null ? d.getVolunteer().getUser().getFullName() : null)
                .volunteerPhone(d.getVolunteer() != null && d.getVolunteer().getUser() != null ? d.getVolunteer().getUser().getPhone() : null)
                .requestId(d.getRequest() != null ? d.getRequest().getId() : null)
                .status(d.getStatus())
                .pickupTime(d.getPickupTime())
                .deliveryTime(d.getDeliveryTime())
                .pickupVerificationCode(d.getPickupVerificationCode())
                .deliveryVerificationCode(d.getDeliveryVerificationCode())
                .notes(d.getNotes())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
