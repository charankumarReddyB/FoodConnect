package com.foodconnect.repository.firestore;

import com.foodconnect.entity.Volunteer;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;

@Slf4j
@Repository
public class FirestoreVolunteerRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "volunteers";

    public Volunteer save(Volunteer volunteer) {
        if (volunteer.getId() == null) {
            volunteer.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return volunteer;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(volunteer.getId().toString());
            Map<String, Object> map = toMap(volunteer);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return volunteer;
        } catch (Exception e) {
            log.error("Error saving volunteer to Firestore: {}", e.getMessage(), e);
            return volunteer;
        }
    }

    public Optional<Volunteer> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching volunteer by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Volunteer> findByUserId(UUID userId) {
        if (firestore == null || userId == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId.toString())
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error finding volunteer by user ID in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    private Map<String, Object> toMap(Volunteer v) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", v.getId().toString());
        map.put("userId", v.getUser() != null ? v.getUser().getId().toString() : null);
        map.put("vehicleType", v.getVehicleType());
        map.put("isAvailable", v.getIsAvailable() != null ? v.getIsAvailable() : true);
        map.put("currentLatitude", v.getCurrentLatitude());
        map.put("currentLongitude", v.getCurrentLongitude());
        return map;
    }

    private Volunteer fromSnapshot(DocumentSnapshot doc) {
        Volunteer v = new Volunteer();
        v.setId(UUID.fromString(doc.getId()));
        String uId = doc.getString("userId");
        if (uId != null && userRepository != null) userRepository.findById(UUID.fromString(uId)).ifPresent(v::setUser);
        v.setVehicleType(doc.getString("vehicleType"));
        Boolean avail = doc.getBoolean("isAvailable");
        v.setIsAvailable(avail != null ? avail : true);
        v.setCurrentLatitude(doc.getDouble("currentLatitude"));
        v.setCurrentLongitude(doc.getDouble("currentLongitude"));
        return v;
    }
}
