package com.foodconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "volunteers", indexes = {
    @Index(name = "idx_volunteers_user", columnList = "user_id"),
    @Index(name = "idx_volunteers_available", columnList = "is_available"),
    @Index(name = "idx_volunteers_location", columnList = "current_latitude, current_longitude")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "vehicle_type", nullable = false, length = 50)
    @Builder.Default
    private String vehicleType = "BICYCLE";

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Builder.Default
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Builder.Default
    @Column(precision = 3, scale = 2)
    private Double rating = 5.00;

    @Builder.Default
    @Column(name = "completed_deliveries_count", nullable = false)
    private Integer completedDeliveriesCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
