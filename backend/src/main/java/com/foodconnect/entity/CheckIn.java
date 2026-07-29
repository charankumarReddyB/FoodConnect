package com.foodconnect.entity;

import com.foodconnect.enums.CheckInStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "check_ins", indexes = {
    @Index(name = "idx_checkins_user", columnList = "user_id"),
    @Index(name = "idx_checkins_timestamp", columnList = "checked_in_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "event_id", length = 100)
    private String eventId;

    @Column(length = 255)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private CheckInStatus status = CheckInStatus.CHECKED_IN;

    @CreationTimestamp
    @Column(name = "checked_in_at", nullable = false, updatable = false)
    private OffsetDateTime checkedInAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
