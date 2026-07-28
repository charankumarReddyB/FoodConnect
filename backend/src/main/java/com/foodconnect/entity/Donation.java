package com.foodconnect.entity;

import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "donations", indexes = {
    @Index(name = "idx_donations_location", columnList = "latitude, longitude"),
    @Index(name = "idx_donations_status", columnList = "status"),
    @Index(name = "idx_donations_category", columnList = "category"),
    @Index(name = "idx_donations_donor", columnList = "donor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private User donor;

    @Column(name = "food_name", nullable = false, length = 150)
    private String foodName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FoodCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "veg_nonveg", nullable = false, length = 20)
    private VegNonVeg vegNonVeg;

    @Column(nullable = false, length = 100)
    private String quantity;

    @Column(name = "estimated_servings", nullable = false)
    private Integer estimatedServings;

    @Column(name = "prepared_time", nullable = false)
    private LocalDateTime preparedTime;

    @Column(name = "pickup_deadline", nullable = false)
    private LocalDateTime pickupDeadline;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_method", nullable = false, length = 50)
    private DeliveryMethod deliveryMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private DonationStatus status = DonationStatus.CREATED;

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FoodImage> images = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
