package com.foodconnect.dto.donation;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationResponse {

    private Long id;
    private Long donorId;
    private String donorName;
    private String donorPhone;
    private String foodName;
    private String description;
    private FoodCategory category;
    private VegNonVeg vegNonVeg;
    private String quantity;
    private Integer estimatedServings;
    private LocalDateTime preparedTime;
    private LocalDateTime pickupDeadline;
    private String address;
    private Double latitude;
    private Double longitude;
    private DeliveryMethod deliveryMethod;
    private DonationStatus status;
    private List<String> imageUrls;
    private Double distanceKm;
    private LocalDateTime createdAt;
}
