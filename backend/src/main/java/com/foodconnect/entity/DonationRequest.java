package com.foodconnect.entity;

import com.foodconnect.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donation_requests", uniqueConstraints = {
    @UniqueConstraint(name = "unique_donation_recipient", columnNames = {"donation_id", "recipient_id"})
}, indexes = {
    @Index(name = "idx_requests_donation", columnList = "donation_id"),
    @Index(name = "idx_requests_recipient", columnList = "recipient_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @CreationTimestamp
    @Column(name = "request_time", updatable = false)
    private LocalDateTime requestTime;

    @Column(name = "approval_time")
    private LocalDateTime approvalTime;
}
