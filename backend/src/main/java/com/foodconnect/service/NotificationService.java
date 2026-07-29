package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.response.NotificationResponse;
import com.foodconnect.enums.NotificationType;

import java.util.UUID;

public interface NotificationService {
    NotificationResponse sendNotification(UUID userId, NotificationType type, String title, String message, String metadata);
    PagedResponse<NotificationResponse> getUserNotifications(UUID userId, int page, int size);
    void markAsRead(UUID notificationId, UUID userId);
    long getUnreadCount(UUID userId);
}
