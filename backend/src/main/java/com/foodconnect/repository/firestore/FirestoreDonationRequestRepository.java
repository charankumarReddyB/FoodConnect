package com.foodconnect.repository.firestore;

import com.foodconnect.entity.DonationRequest;
import com.foodconnect.enums.RequestStatus;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.*;

@Slf4j
@Repository
public class FirestoreDonationRequestRepository {

    @Autowired(required = false)
    private Firestore firestore;

    @Autowired(required = false)
    private FirestoreDonationRepository donationRepository;

    @Autowired(required = false)
    private FirestoreOrganizationRepository organizationRepository;

    private static final String COLLECTION_NAME = "donation_requests";

    public DonationRequest save(DonationRequest req) {
        if (req.getId() == null) {
            req.setId(UUID.randomUUID());
        }
        if (firestore == null) {
            return req;
        }

        try {
            DocumentReference docRef = firestore.collection(COLLECTION_NAME).document(req.getId().toString());
            Map<String, Object> map = toMap(req);
            ApiFuture<WriteResult> result = docRef.set(map);
            result.get();
            return req;
        } catch (Exception e) {
            log.error("Error saving donation request to Firestore: {}", e.getMessage(), e);
            return req;
        }
    }

    public Optional<DonationRequest> findById(UUID id) {
        if (firestore == null || id == null) return Optional.empty();
        try {
            DocumentSnapshot snapshot = firestore.collection(COLLECTION_NAME).document(id.toString()).get().get();
            if (snapshot.exists()) {
                return Optional.ofNullable(fromSnapshot(snapshot));
            }
        } catch (Exception e) {
            log.error("Error fetching donation request by ID from Firestore: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public List<DonationRequest> findByDonationId(UUID donationId) {
        if (firestore == null || donationId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("donationId", donationId.toString())
                    .get().get();
            List<DonationRequest> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying donation requests by donation ID in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<DonationRequest> findByRecipientId(UUID recipientId) {
        if (firestore == null || recipientId == null) return Collections.emptyList();
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("recipientId", recipientId.toString())
                    .get().get();
            List<DonationRequest> list = new ArrayList<>();
            for (DocumentSnapshot doc : query.getDocuments()) {
                list.add(fromSnapshot(doc));
            }
            return list;
        } catch (Exception e) {
            log.error("Error querying donation requests by recipient ID in Firestore: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public boolean existsByDonationIdAndRecipientId(UUID donationId, UUID recipientId) {
        if (firestore == null || donationId == null || recipientId == null) return false;
        try {
            QuerySnapshot query = firestore.collection(COLLECTION_NAME)
                    .whereEqualTo("donationId", donationId.toString())
                    .whereEqualTo("recipientId", recipientId.toString())
                    .get().get();
            return !query.isEmpty();
        } catch (Exception e) {
            return false;
        }
    }

    private Map<String, Object> toMap(DonationRequest req) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId().toString());
        map.put("donationId", req.getDonation() != null ? req.getDonation().getId().toString() : null);
        map.put("recipientId", req.getRecipient() != null ? req.getRecipient().getId().toString() : null);
        map.put("requestedServings", req.getRequestedServings());
        map.put("notes", req.getNotes());
        map.put("status", req.getStatus() != null ? req.getStatus().name() : RequestStatus.PENDING.name());
        return map;
    }

    private DonationRequest fromSnapshot(DocumentSnapshot doc) {
        DonationRequest r = new DonationRequest();
        r.setId(UUID.fromString(doc.getId()));
        String donId = doc.getString("donationId");
        if (donId != null && donationRepository != null) donationRepository.findById(UUID.fromString(donId)).ifPresent(r::setDonation);
        String recId = doc.getString("recipientId");
        if (recId != null && organizationRepository != null) organizationRepository.findById(UUID.fromString(recId)).ifPresent(r::setRecipient);
        Long serv = doc.getLong("requestedServings");
        r.setRequestedServings(serv != null ? serv.intValue() : 0);
        r.setNotes(doc.getString("notes"));
        String st = doc.getString("status");
        if (st != null) r.setStatus(RequestStatus.valueOf(st));
        return r;
    }
}
