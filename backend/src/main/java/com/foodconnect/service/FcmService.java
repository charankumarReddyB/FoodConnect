package com.foodconnect.service;

import java.util.Map;
import java.util.UUID;

public interface FcmService {
    void sendNotification(UUID userId, String title, String body, Map<String, String> data);
    void sendMulticastNotification(Iterable<String> fcmTokens, String title, String body, Map<String, String> data);
}
