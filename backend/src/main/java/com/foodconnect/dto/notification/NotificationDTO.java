package com.foodconnect.dto.notification;

import com.foodconnect.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private Boolean readStatus;
    private NotificationType notificationType;
    private LocalDateTime timestamp;
}
