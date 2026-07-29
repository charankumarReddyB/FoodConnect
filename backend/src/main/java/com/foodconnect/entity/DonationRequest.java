package com.foodconnect.entity;

import com.foodconnect.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "donation_requests", indexes = {
    @Index(name = "idx_requests_donation", columnList = "donation_id"),
    @Index(name = "idx_requests_recipient", columnList = "recipient_id"),
    @Index(name = "idx_requests_status", columnList = "status")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_donation_recipient", columnNames = {"donation_id", "recipient_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Organization recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "requested_servings")
    private Integer requestedServings;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "request_time", nullable = false, updatable = false)
    private OffsetDateTime requestTime;

    @Column(name = "response_time")
    private OffsetDateTime responseTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
