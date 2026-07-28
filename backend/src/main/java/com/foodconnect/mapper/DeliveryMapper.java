package com.foodconnect.mapper;

import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.entity.Delivery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeliveryMapper {

    private final DonationMapper donationMapper;
    private final VolunteerMapper volunteerMapper;

    public DeliveryResponse toResponse(Delivery delivery) {
        if (delivery == null) return null;

        return DeliveryResponse.builder()
                .id(delivery.getId())
                .donation(donationMapper.toResponse(delivery.getDonation()))
                .volunteer(volunteerMapper.toResponse(delivery.getVolunteer()))
                .pickupTime(delivery.getPickupTime())
                .deliveryTime(delivery.getDeliveryTime())
                .status(delivery.getStatus())
                .currentLocation(delivery.getCurrentLocation())
                .build();
    }
}
