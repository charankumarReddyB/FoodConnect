package com.foodconnect.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.service-account-path:${FIREBASE_CONFIG_PATH:firebase-service-account.json}}")
    private String serviceAccountPath;

    @PostConstruct
    public void initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp already initialized.");
            return;
        }

        try {
            InputStream serviceAccount = null;
            if (Files.exists(Paths.get(serviceAccountPath))) {
                log.info("Loading Firebase Service Account from file: {}", serviceAccountPath);
                serviceAccount = new FileInputStream(serviceAccountPath);
            } else {
                ClassLoader classLoader = getClass().getClassLoader();
                serviceAccount = classLoader.getResourceAsStream("firebase-service-account.json");
            }

            if (serviceAccount != null) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK successfully initialized.");
            } else {
                log.warn("[FIREBASE CONFIG NOTICE] No 'firebase-service-account.json' found at path '{}' or classpath. Firebase ID Tokens will be verified in dev/mock fallback mode until service account JSON is supplied.", serviceAccountPath);
            }
        } catch (Exception e) {
            log.error("Error initializing Firebase Admin SDK: {}", e.getMessage(), e);
        }
    }
}
