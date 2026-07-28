package com.foodconnect.dto.request;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DonationUpdateRequest {
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
    private List<String> imageUrls;
}
