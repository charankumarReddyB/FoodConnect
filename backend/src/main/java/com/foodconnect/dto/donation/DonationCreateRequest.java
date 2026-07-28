package com.foodconnect.dto.donation;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DonationCreateRequest {

    @NotBlank(message = "Food name is required")
    private String foodName;

    private String description;

    @NotNull(message = "Food category is required")
    private FoodCategory category;

    @NotNull(message = "Veg/Non-Veg type is required")
    private VegNonVeg vegNonVeg;

    @NotBlank(message = "Quantity description is required")
    private String quantity;

    @NotNull(message = "Estimated servings is required")
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer estimatedServings;

    @NotNull(message = "Prepared time is required")
    private LocalDateTime preparedTime;

    @NotNull(message = "Pickup deadline is required")
    @Future(message = "Pickup deadline must be in the future")
    private LocalDateTime pickupDeadline;

    @NotBlank(message = "Pickup address is required")
    private String address;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Delivery method is required")
    private DeliveryMethod deliveryMethod;

    private List<String> imageUrls;
}
