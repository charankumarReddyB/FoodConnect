package com.foodconnect.repository.firestore;

import com.foodconnect.entity.Notification;
import com.foodconnect.enums.NotificationType;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Repository
public class FirestoreNotificationRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "notifications";

    public Notification save(Notification n) {
        if (n.getId() == null) {
            n.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return n;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(n.getId().toString());
            Map<String, Object> map = toMap(n);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return n;
        } catch (Exception e) {
            log.error("Error saving notification to Firestore: {}", e.getMessage(), e);
            return n;
        }
    }

    public List<Notification> findByUserId(UUID userId) {
        if (firestore == null || userId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId.toString())
                    .get().get();
            List<Notification> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying notifications by user ID from Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private Map<String, Object> toMap(Notification n) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId().toString());
        map.put("userId", n.getUser() != null ? n.getUser().getId().toString() : null);
        map.put("title", n.getTitle());
        map.put("message", n.getMessage());
        map.put("type", n.getType() != null ? n.getType().name() : NotificationType.SYSTEM_ALERT.name());
        map.put("isRead", n.getIsRead() != null ? n.getIsRead() : false);
        map.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : OffsetDateTime.now().toString());
        return map;
    }

    private Notification fromSnapshot(DocumentSnapshot doc) {
        Notification n = new Notification();
        n.setId(UUID.fromString(doc.getId()));
        String uId = doc.getString("userId");
        if (uId != null && userRepository != null) userRepository.findById(UUID.fromString(uId)).ifPresent(n::setUser);
        n.setTitle(doc.getString("title"));
        n.setMessage(doc.getString("message"));
        String tp = doc.getString("type");
        if (tp != null) n.setType(NotificationType.valueOf(tp));
        Boolean read = doc.getBoolean("isRead");
        n.setIsRead(read != null ? read : false);
        String ct = doc.getString("createdAt");
        if (ct != null) n.setCreatedAt(OffsetDateTime.parse(ct));
        return n;
    }
}
