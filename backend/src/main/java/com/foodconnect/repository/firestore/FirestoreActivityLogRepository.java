package com.foodconnect.repository.firestore;

import com.foodconnect.entity.ActivityLog;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Repository
public class FirestoreActivityLogRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "activity_logs";

    public ActivityLog save(ActivityLog logEntity) {
        if (logEntity.getId() == null) {
            logEntity.setId(System.currentTimeMillis());
        }
        if (firestore == null) {
            return logEntity;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(logEntity.getId().toString());
            Map<String, Object> map = toMap(logEntity);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return logEntity;
        } catch (Exception e) {
            log.error("Error saving activity log to Firestore: {}", e.getMessage(), e);
            return logEntity;
        }
    }

    public Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable) {
        if (firestore == null) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .orderBy("timestamp", Query.Direction.DESCENDING)
                    .limit(pageable.getPageSize())
                    .get().get();
            List<ActivityLog> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return new PageImpl<>(list, pageable, list.size());
        } catch (Exception e) {
            log.error("Error querying activity logs from Firestore: {}", e.getMessage());
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }

    private Map<String, Object> toMap(ActivityLog l) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", l.getId().toString());
        map.put("userId", l.getUser() != null ? l.getUser().getId().toString() : null);
        map.put("action", l.getAction());
        map.put("details", l.getDetails());
        map.put("timestamp", l.getTimestamp() != null ? l.getTimestamp().toString() : LocalDateTime.now().toString());
        return map;
    }

    private ActivityLog fromSnapshot(DocumentSnapshot doc) {
        ActivityLog l = new ActivityLog();
        try {
            l.setId(Long.parseLong(doc.getId()));
        } catch (Exception e) {
            l.setId(System.currentTimeMillis());
        }
        String uId = doc.getString("userId");
        if (uId != null && userRepository != null) userRepository.findById(UUID.fromString(uId)).ifPresent(l::setUser);
        l.setAction(doc.getString("action"));
        l.setDetails(doc.getString("details"));
        String ts = doc.getString("timestamp");
        if (ts != null) l.setTimestamp(LocalDateTime.parse(ts));
        return l;
    }
}
