package com.foodconnect.dto.response;

import com.foodconnect.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private OffsetDateTime readAt;
    private String metadata;
    private OffsetDateTime createdAt;
}
