package com.foodconnect.repository.firestore;

import com.foodconnect.entity.Organization;
import com.foodconnect.enums.OrganizationType;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;

@Slf4j
@Repository
public class FirestoreOrganizationRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "organizations";

    public Organization save(Organization orgEntity) {
        if (orgEntity.getId() == null) {
            orgEntity.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return orgEntity;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(orgEntity.getId().toString());
            Map<String, Object> map = toMap(orgEntity);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return orgEntity;
        } catch (Exception e) {
            log.error("Error saving organization to Firestore: {}", e.getMessage(), e);
            return orgEntity;
        }
    }

    public Optional<Organization> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching organization by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Organization> findByUserId(UUID userId) {
        if (firestore == null || userId == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("userId", userId.toString())
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error finding organization by user ID in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    private Map<String, Object> toMap(Organization o) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", o.getId().toString());
        map.put("userId", o.getUser() != null ? o.getUser().getId().toString() : null);
        map.put("organizationName", o.getOrganizationName());
        map.put("registrationNumber", o.getRegistrationNumber());
        map.put("orgType", o.getOrgType() != null ? o.getOrgType().name() : OrganizationType.NGO.name());
        map.put("address", o.getAddress());
        map.put("contactPhone", o.getContactPhone());
        map.put("contactEmail", o.getContactEmail());
        map.put("isVerified", o.getIsVerified() != null ? o.getIsVerified() : false);
        return map;
    }

    private Organization fromSnapshot(DocumentSnapshot doc) {
        Organization o = new Organization();
        o.setId(UUID.fromString(doc.getId()));
        String uId = doc.getString("userId");
        if (uId != null && userRepository != null) userRepository.findById(UUID.fromString(uId)).ifPresent(o::setUser);
        o.setOrganizationName(doc.getString("organizationName"));
        o.setRegistrationNumber(doc.getString("registrationNumber"));
        String ot = doc.getString("orgType");
        if (ot != null) o.setOrgType(OrganizationType.valueOf(ot));
        o.setAddress(doc.getString("address"));
        o.setContactPhone(doc.getString("contactPhone"));
        o.setContactEmail(doc.getString("contactEmail"));
        Boolean verified = doc.getBoolean("isVerified");
        o.setIsVerified(verified != null ? verified : false);
        return o;
    }
}
