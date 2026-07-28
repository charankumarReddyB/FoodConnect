package com.foodconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SettingsUpdateRequest {
    @NotBlank(message = "Value is required")
    private String value;
    private String description;
}
