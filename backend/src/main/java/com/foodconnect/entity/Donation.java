package com.foodconnect.entity;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "donations", indexes = {
    @Index(name = "idx_donations_donor", columnList = "donor_id"),
    @Index(name = "idx_donations_status", columnList = "status"),
    @Index(name = "idx_donations_food_type", columnList = "food_type"),
    @Index(name = "idx_donations_location", columnList = "latitude, longitude"),
    @Index(name = "idx_donations_expiry", columnList = "expiry_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_type", nullable = false)
    @Builder.Default
    private FoodType foodType = FoodType.VEG;

    @Column(name = "quantity_description", nullable = false, length = 100)
    private String quantityDescription;

    @Column(name = "estimated_servings", nullable = false)
    private Integer estimatedServings;

    @Column(name = "prepared_time", nullable = false)
    private OffsetDateTime preparedTime;

    @Column(name = "expiry_time", nullable = false)
    private OffsetDateTime expiryTime;

    @Column(name = "pickup_address", nullable = false, columnDefinition = "TEXT")
    private String pickupAddress;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false)
    @Builder.Default
    private DeliveryMethod deliveryMethod = DeliveryMethod.VOLUNTEER_DELIVERY;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DonationStatus status = DonationStatus.CREATED;

    @Builder.Default
    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FoodImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
