package com.foodconnect.dto.request;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.FoodType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonationCreateRequest {

    @NotBlank(message = "Donation title is required")
    private String title;

    private String description;

    @NotNull(message = "Food type selection is required")
    private FoodType foodType;

    @NotBlank(message = "Quantity description is required")
    private String quantityDescription;

    @NotNull(message = "Estimated servings is required")
    @Min(value = 1, message = "Estimated servings must be at least 1")
    private Integer estimatedServings;

    @NotNull(message = "Prepared time is required")
    private OffsetDateTime preparedTime;

    @NotNull(message = "Expiry time is required")
    @Future(message = "Expiry time must be in the future")
    private OffsetDateTime expiryTime;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    @NotNull(message = "Delivery method is required")
    private DeliveryMethod deliveryMethod;

    private List<String> imageUrls;
}
