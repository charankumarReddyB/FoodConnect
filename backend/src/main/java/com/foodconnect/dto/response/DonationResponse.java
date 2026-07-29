package com.foodconnect.dto.response;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {
    private UUID id;
    private UUID donorId;
    private String donorName;
    private String donorEmail;
    private String title;
    private String description;
    private FoodType foodType;
    private String quantityDescription;
    private Integer estimatedServings;
    private OffsetDateTime preparedTime;
    private OffsetDateTime expiryTime;
    private String pickupAddress;
    private Double latitude;
    private Double longitude;
    private DeliveryMethod deliveryMethod;
    private DonationStatus status;
    private List<String> imageUrls;
    private OffsetDateTime createdAt;
}
