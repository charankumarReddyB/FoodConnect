package com.foodconnect.repository.firestore;

import com.foodconnect.entity.CheckIn;
import com.foodconnect.enums.CheckInStatus;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Repository
public class FirestoreCheckInRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "check_ins";

    public CheckIn save(CheckIn checkIn) {
        if (checkIn.getId() == null) {
            checkIn.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return checkIn;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(checkIn.getId().toString());
            Map<String, Object> map = toMap(checkIn);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return checkIn;
        } catch (Exception e) {
            log.error("Error saving check-in to Firestore: {}", e.getMessage(), e);
            return checkIn;
        }
    }

    public Optional<CheckIn> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching check-in by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public List<CheckIn> findByUserId(UUID userId) {
        if (firestore == null || userId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId.toString())
                    .get().get();
            List<CheckIn> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying check-ins by user ID in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public void deleteById(UUID id) {
        if (firestore == null || id == null) return;
        try {
            firestore.collection(COLLECTION_NAME).document(id.toString()).delete().get();
        } catch (Exception e) {
            log.error("Error deleting check-in by ID from Firestore: {}", e.getMessage());
        }
    }

    public List<CheckIn> findAll() {
        if (firestore == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME).get().get();
            List<CheckIn> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private Map<String, Object> toMap(CheckIn c) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", c.getId().toString());
        map.put("userId", c.getUser() != null ? c.getUser().getId().toString() : null);
        map.put("eventId", c.getEventId());
        map.put("checkedInAt", c.getCheckedInAt() != null ? c.getCheckedInAt().toString() : null);
        map.put("location", c.getLocation());
        map.put("notes", c.getNotes());
        map.put("status", c.getStatus() != null ? c.getStatus().name() : CheckInStatus.CHECKED_IN.name());
        return map;
    }

    private CheckIn fromSnapshot(DocumentSnapshot doc) {
        CheckIn c = new CheckIn();
        c.setId(UUID.fromString(doc.getId()));
        String uId = doc.getString("userId");
        if (uId != null && userRepository != null) userRepository.findById(UUID.fromString(uId)).ifPresent(c::setUser);
        c.setEventId(doc.getString("eventId"));
        String cit = doc.getString("checkedInAt");
        if (cit != null) c.setCheckedInAt(OffsetDateTime.parse(cit));
        c.setLocation(doc.getString("location"));
        c.setNotes(doc.getString("notes"));
        String st = doc.getString("status");
        if (st != null) c.setStatus(CheckInStatus.valueOf(st));
        return c;
    }
}
