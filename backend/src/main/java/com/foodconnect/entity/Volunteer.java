package com.foodconnect.entity;

import com.foodconnect.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "volunteers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 50)
    private VehicleType vehicleType;

    @Builder.Default
    @Column(nullable = false)
    private Boolean availability = true;

    @Builder.Default
    @Column(nullable = false)
    private Double rating = 5.0;

    @Builder.Default
    @Column(name = "completed_deliveries", nullable = false)
    private Integer completedDeliveries = 0;
}
