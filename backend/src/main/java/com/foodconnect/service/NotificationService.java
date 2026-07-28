package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.notification.NotificationDTO;
import com.foodconnect.enums.NotificationType;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    NotificationDTO sendNotification(Long userId, String message, NotificationType type);
    PagedResponse<NotificationDTO> getUserNotifications(Long userId, Pageable pageable);
    void markAsRead(Long notificationId, Long userId);
}
