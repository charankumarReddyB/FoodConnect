package com.foodconnect.repository.firestore;

import com.foodconnect.entity.Donation;
import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Repository
public class FirestoreDonationRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreUserRepository userRepository;

    private static final String COLLECTION_NAME = "donations";

    public Donation save(Donation donation) {
        if (donation.getId() == null) {
            donation.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return donation;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(donation.getId().toString());
            Map<String, Object> map = toMap(donation);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return donation;
        } catch (Exception e) {
            log.error("Error saving donation to Firestore: {}", e.getMessage(), e);
            return donation;
        }
    }

    public Optional<Donation> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching donation by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public List<Donation> findByStatus(DonationStatus status) {
        if (firestore == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("status", status.name())
                    .get().get();
            List<Donation> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying donations by status in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Donation> findByDonorId(UUID donorId) {
        if (firestore == null || donorId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("donorId", donorId.toString())
                    .get().get();
            List<Donation> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying donations by donor ID in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public long countByStatus(DonationStatus status) {
        return findByStatus(status).size();
    }

    public long count() {
        if (firestore == null) return 0;
        try {
            return firestore.collection(COLLECTION_NAME).get().get().size();
        } catch (Exception e) {
            return 0;
        }
    }

    private Map<String, Object> toMap(Donation donation) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", donation.getId().toString());
        map.put("donorId", donation.getDonor() != null ? donation.getDonor().getId().toString() : null);
        map.put("title", donation.getTitle());
        map.put("description", donation.getDescription());
        map.put("foodType", donation.getFoodType() != null ? donation.getFoodType().name() : FoodType.VEG.name());
        map.put("quantityDescription", donation.getQuantityDescription());
        map.put("estimatedServings", donation.getEstimatedServings());
        map.put("preparedTime", donation.getPreparedTime() != null ? donation.getPreparedTime().toString() : null);
        map.put("expiryTime", donation.getExpiryTime() != null ? donation.getExpiryTime().toString() : null);
        map.put("status", donation.getStatus() != null ? donation.getStatus().name() : DonationStatus.CREATED.name());
        map.put("deliveryMethod", donation.getDeliveryMethod() != null ? donation.getDeliveryMethod().name() : DeliveryMethod.VOLUNTEER_DELIVERY.name());
        map.put("pickupAddress", donation.getPickupAddress());
        map.put("pickupLatitude", donation.getLatitude());
        map.put("pickupLongitude", donation.getLongitude());
        map.put("latitude", donation.getLatitude());
        map.put("longitude", donation.getLongitude());
        if (donation.getLatitude() != null && donation.getLongitude() != null) {
            map.put("pickupLocation", new GeoPoint(donation.getLatitude(), donation.getLongitude()));
        }
        if (donation.getImages() != null && !donation.getImages().isEmpty()) {
            List<String> urls = new ArrayList<>();
            for (com.foodconnect.entity.FoodImage img : donation.getImages()) {
                if (img.getImageUrl() != null) urls.add(img.getImageUrl());
            }
            map.put("imageUrls", urls);
        } else {
            map.put("imageUrls", new ArrayList<>());
        }
        map.put("createdAt", donation.getCreatedAt() != null ? donation.getCreatedAt().toString() : OffsetDateTime.now().toString());
        map.put("updatedAt", donation.getUpdatedAt() != null ? donation.getUpdatedAt().toString() : OffsetDateTime.now().toString());
        return map;
    }

    private Donation fromSnapshot(DocumentSnapshot doc) {
        Donation d = new Donation();
        d.setId(UUID.fromString(doc.getId()));
        String donorIdStr = doc.getString("donorId");
        if (donorIdStr != null && userRepository != null) {
            userRepository.findById(UUID.fromString(donorIdStr)).ifPresent(d::setDonor);
        }
        d.setTitle(doc.getString("title"));
        d.setDescription(doc.getString("description"));
        String ft = doc.getString("foodType");
        if (ft != null) d.setFoodType(FoodType.valueOf(ft));
        d.setQuantityDescription(doc.getString("quantityDescription"));
        Long serv = doc.getLong("estimatedServings");
        d.setEstimatedServings(serv != null ? serv.intValue() : 0);
        String prep = doc.getString("preparedTime");
        if (prep != null) d.setPreparedTime(OffsetDateTime.parse(prep));
        String exp = doc.getString("expiryTime");
        if (exp != null) d.setExpiryTime(OffsetDateTime.parse(exp));
        String st = doc.getString("status");
        if (st != null) d.setStatus(DonationStatus.valueOf(st));
        String dm = doc.getString("deliveryMethod");
        if (dm != null) d.setDeliveryMethod(DeliveryMethod.valueOf(dm));
        d.setPickupAddress(doc.getString("pickupAddress"));
        d.setLatitude(doc.getDouble("latitude"));
        d.setLongitude(doc.getDouble("longitude"));
        String ca = doc.getString("createdAt");
        if (ca != null) d.setCreatedAt(OffsetDateTime.parse(ca));
        String ua = doc.getString("updatedAt");
        if (ua != null) d.setUpdatedAt(OffsetDateTime.parse(ua));
        return d;
    }
}
