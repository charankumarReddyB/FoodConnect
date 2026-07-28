package com.foodconnect.dto.request;

import com.foodconnect.enums.OrganizationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrganizationCreateRequest {
    @NotBlank(message = "Organization name is required")
    private String organizationName;

    @NotNull(message = "Organization type is required")
    private OrganizationType type;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
}
