package com.foodconnect.service.impl;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.notification.NotificationDTO;
import com.foodconnect.entity.Notification;
import com.foodconnect.entity.User;
import com.foodconnect.enums.NotificationType;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.NotificationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public NotificationDTO sendNotification(Long userId, String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .readStatus(false)
                .notificationType(type)
                .build();

        Notification saved = notificationRepository.save(notification);
        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        List<NotificationDTO> content = page.getContent().stream().map(this::toDTO).toList();
        return new PagedResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.isLast());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You cannot mark another user's notification as read");
        }

        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }

    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .message(notification.getMessage())
                .readStatus(notification.getReadStatus())
                .notificationType(notification.getNotificationType())
                .timestamp(notification.getTimestamp())
                .build();
    }
}
