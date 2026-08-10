package com.foodconnect.repository.firestore;

import com.foodconnect.entity.Delivery;
import com.foodconnect.enums.DeliveryStatus;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;

@Slf4j
@Repository
public class FirestoreDeliveryRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreDonationRepository donationRepository;

    @Autowired(required = false)
    private FirestoreVolunteerRepository volunteerRepository;

    private static final String COLLECTION_NAME = "deliveries";

    public Delivery save(Delivery delivery) {
        if (delivery.getId() == null) {
            delivery.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return delivery;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(delivery.getId().toString());
            Map<String, Object> map = toMap(delivery);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return delivery;
        } catch (Exception e) {
            log.error("Error saving delivery to Firestore: {}", e.getMessage(), e);
            return delivery;
        }
    }

    public Optional<Delivery> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching delivery by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Delivery> findByDonationId(UUID donationId) {
        if (firestore == null || donationId == null) return Optional.empty();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("donationId", donationId.toString())
                    .get().get();
            if (!query.isEmpty()) {
                return Optional.ofNullable(fromSnapshot(query.getDocuments().get(0)));
            }
        } catch (Exception e) {
            log.error("Error querying delivery by donation ID in Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public List<Delivery> findByVolunteerId(UUID volunteerId) {
        if (firestore == null || volunteerId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("volunteerId", volunteerId.toString())
                    .get().get();
            List<Delivery> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying deliveries by volunteer ID in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public long countByStatus(DeliveryStatus status) {
        if (firestore == null) return 0;
        try {
            return firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("status", status.name())
                    .get().get().size();
        } catch (Exception e) {
            return 0;
        }
    }

    public long count() {
        if (firestore == null) return 0;
        try {
            return firestore.collection(COLLECTION_NAME).get().get().size();
        } catch (Exception e) {
            return 0;
        }
    }

    private Map<String, Object> toMap(Delivery d) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", d.getId().toString());
        map.put("donationId", d.getDonation() != null ? d.getDonation().getId().toString() : null);
        map.put("volunteerId", d.getVolunteer() != null ? d.getVolunteer().getId().toString() : null);
        map.put("status", d.getStatus() != null ? d.getStatus().name() : DeliveryStatus.UNASSIGNED.name());
        map.put("pickupVerificationCode", d.getPickupVerificationCode());
        map.put("deliveryVerificationCode", d.getDeliveryVerificationCode());
        map.put("notes", d.getNotes());
        return map;
    }

    private Delivery fromSnapshot(DocumentSnapshot doc) {
        Delivery d = new Delivery();
        d.setId(UUID.fromString(doc.getId()));
        String donId = doc.getString("donationId");
        if (donId != null && donationRepository != null) donationRepository.findById(UUID.fromString(donId)).ifPresent(d::setDonation);
        String volId = doc.getString("volunteerId");
        if (volId != null && volunteerRepository != null) volunteerRepository.findById(UUID.fromString(volId)).ifPresent(d::setVolunteer);
        String st = doc.getString("status");
        if (st != null) d.setStatus(DeliveryStatus.valueOf(st));
        d.setPickupVerificationCode(doc.getString("pickupVerificationCode"));
        d.setDeliveryVerificationCode(doc.getString("deliveryVerificationCode"));
        d.setNotes(doc.getString("notes"));
        return d;
    }
}
