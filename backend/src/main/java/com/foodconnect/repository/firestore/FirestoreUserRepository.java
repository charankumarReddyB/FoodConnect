package com.foodconnect.repository.firestore;

import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;

@Slf4j
@Repository
public class FirestoreUserRepository {

    @Autowired(required = false)
    private Firestore firestore;

    private static final String COLLECTION_NAME = "users";

    public User save(User user) {
        if (user.getId() == null) {
            user.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return user;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(user.getId().toString());
            Map<String, Object> map = toMap(user);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return user;
        } catch (Exception e) {
            log.error("Error saving user to Firestore: {}", e.getMessage(), e);
            return user;
        }
    }

    public Optional<User> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching user by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        if (firestore == null || email == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("email", email)
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error finding user by email in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<User> findByPhone(String phone) {
        if (firestore == null || phone == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("phone", phone)
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error finding user by phone in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<User> findByGoogleId(String googleId) {
        if (firestore == null || googleId == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("googleId", googleId)
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error finding user by googleId in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

    public boolean existsByPhone(String phone) {
        return findByPhone(phone).isPresent();
    }

    public long count() {
        if (firestore == null) return 0;
        try {
            return firestore.collection(COLLECTION_NAME).get().get().size();
        } catch (Exception e) {
            return 0;
        }
    }

    private Map<String, Object> toMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId().toString());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("googleId", user.getGoogleId());
        map.put("passwordHash", user.getPasswordHash());
        map.put("fullName", user.getFullName());
        map.put("role", user.getRole() != null ? user.getRole().name() : UserRole.DONOR.name());
        map.put("profileImageUrl", user.getProfileImageUrl());
        map.put("address", user.getAddress());
        map.put("latitude", user.getLatitude());
        map.put("longitude", user.getLongitude());
        map.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
        map.put("emailVerified", user.getEmailVerified() != null ? user.getEmailVerified() : false);
        map.put("phoneVerified", user.getPhoneVerified() != null ? user.getPhoneVerified() : false);
        return map;
    }

    private User fromSnapshot(DocumentSnapshot doc) {
        User u = new User();
        u.setId(UUID.fromString(doc.getId()));
        u.setEmail(doc.getString("email"));
        u.setPhone(doc.getString("phone"));
        u.setGoogleId(doc.getString("googleId"));
        u.setPasswordHash(doc.getString("passwordHash"));
        u.setFullName(doc.getString("fullName"));
        String r = doc.getString("role");
        if (r != null) {
            u.setRole(UserRole.valueOf(r));
        }
        u.setProfileImageUrl(doc.getString("profileImageUrl"));
        u.setAddress(doc.getString("address"));
        u.setLatitude(doc.getDouble("latitude"));
        u.setLongitude(doc.getDouble("longitude"));
        Boolean active = doc.getBoolean("isActive");
        u.setIsActive(active != null ? active : true);
        Boolean ev = doc.getBoolean("emailVerified");
        u.setEmailVerified(ev != null ? ev : false);
        Boolean pv = doc.getBoolean("phoneVerified");
        u.setPhoneVerified(pv != null ? pv : false);
        return u;
    }
}
