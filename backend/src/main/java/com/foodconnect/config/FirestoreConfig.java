package com.foodconnect.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class FirestoreConfig {

    @Bean
    public Firestore firestore() {
        if (FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp uninitialized. Firestore bean will remain null until service account JSON is configured.");
            return null;
        }
        try {
            Firestore db = FirestoreClient.getFirestore();
            log.info("Firestore Client bean successfully created.");
            return db;
        } catch (Exception e) {
            log.error("Failed to obtain Firestore Client instance: {}", e.getMessage());
            return null;
        }
    }
}
