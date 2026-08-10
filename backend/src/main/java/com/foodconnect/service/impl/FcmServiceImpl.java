package com.foodconnect.service.impl;

import com.foodconnect.entity.Notification;
import com.foodconnect.enums.NotificationType;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.firestore.FirestoreNotificationRepository;
import com.foodconnect.service.FcmService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmServiceImpl implements FcmService {

    private final UserRepository userRepository;

    @Autowired(required = false)
    private FirestoreNotificationRepository firestoreNotificationRepository;

    @Override
    public void sendNotification(UUID userId, String title, String body, Map<String, String> data) {
        log.info("Preparing FCM push notification for userId: {}, Title: '{}'", userId, title);

        // 1. Record Notification in Firestore
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .user(userRepository.findById(userId).orElse(null))
                .title(title)
                .message(body)
                .type(NotificationType.SYSTEM_ALERT)
                .isRead(false)
                .createdAt(OffsetDateTime.now())
                .build();

        if (firestoreNotificationRepository != null) {
            try {
                firestoreNotificationRepository.save(notification);
            } catch (Exception e) {
                log.warn("Failed to persist notification to Firestore: {}", e.getMessage());
            }
        }

        // 2. Dispatch FCM Push Notification if FirebaseApp is active
        if (!FirebaseApp.getApps().isEmpty()) {
            try {
                Message message = Message.builder()
                        .setTopic("user-" + userId)
                        .setNotification(com.google.firebase.messaging.Notification.builder()
                                .setTitle(title)
                                .setBody(body)
                                .build())
                        .putAllData(data != null ? data : Map.of())
                        .build();

                String response = FirebaseMessaging.getInstance().sendAsync(message).get();
                log.info("FCM push notification successfully dispatched. Response: {}", response);
            } catch (Exception e) {
                log.warn("FCM push notification dispatch skipped or failed: {}", e.getMessage());
            }
        } else {
            log.info("[FCM DEV MODE] Push notification logged for user: {}", userId);
        }
    }

    @Override
    public void sendMulticastNotification(Iterable<String> fcmTokens, String title, String body, Map<String, String> data) {
        log.info("Sending multicast FCM notification to topic / tokens with title: '{}'", title);
        for (String token : fcmTokens) {
            if (token != null && !token.isBlank() && !FirebaseApp.getApps().isEmpty()) {
                try {
                    Message message = Message.builder()
                            .setToken(token)
                            .setNotification(com.google.firebase.messaging.Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build())
                            .putAllData(data != null ? data : Map.of())
                            .build();
                    FirebaseMessaging.getInstance().sendAsync(message);
                } catch (Exception e) {
                    log.warn("Failed to send FCM token message to {}: {}", token, e.getMessage());
                }
            }
        }
    }
}
