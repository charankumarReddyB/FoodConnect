package com.foodconnect.dto.volunteer;

import com.foodconnect.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userPhone;
    private VehicleType vehicleType;
    private Boolean availability;
    private Double rating;
    private Integer completedDeliveries;
}
