package com.foodconnect.config;

import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.firestore.FirestoreUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.beans.factory.ObjectProvider<FirestoreUserRepository> firestoreUserRepositoryProvider;

    private static final String DEFAULT_ROHAN_HASH = "$2a$10$F9yfCQfsGZh38GoCDeZc8uwCgZbqv4/Ze8v7PzVnhfUDdeWFtW/62";
    private static final String DEFAULT_MONIKA_HASH = "$2a$10$/roRaGn.b5v1GEKHrU9Y4.0h677sdb5jbgwfndieA8.N1qgikCk2u";

    @Override
    public void run(String... args) {
        log.info("Initializing default seed data for FoodConnect...");

        FirestoreUserRepository firestoreUserRepository = firestoreUserRepositoryProvider.getIfAvailable();

        if (!userRepository.existsByEmail("charankumarreddybantrothula@gmail.com")) {
            User admin = User.builder()
                    .fullName("Charan Kumar Reddy (Admin)")
                    .email("charankumarreddybantrothula@gmail.com")
                    .phone("+91 9652233592")
                    .passwordHash(passwordEncoder.encode("charan@123"))
                    .role(UserRole.ADMIN)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            User saved = userRepository.save(admin);
            if (firestoreUserRepository != null) {
                try { firestoreUserRepository.save(saved); } catch (Exception ignored) {}
            }
            log.info("Created default admin user: charankumarreddybantrothula@gmail.com (+919652233592)");
        }

        if (!userRepository.existsByEmail("admin@foodconnect.in")) {
            User adminLegacy = User.builder()
                    .fullName("FoodConnect Admin India")
                    .email("admin@foodconnect.in")
                    .phone("+919876543211")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(UserRole.ADMIN)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            User savedLegacy = userRepository.save(adminLegacy);
            if (firestoreUserRepository != null) {
                try { firestoreUserRepository.save(savedLegacy); } catch (Exception ignored) {}
            }
            log.info("Created default legacy admin user: admin@foodconnect.in");
        }

        if (!userRepository.existsByEmail("rohan@gmail.com")) {
            String envRohanPass = System.getenv("ADMIN_ROHAN_PASSWORD");
            String rohanHash = (envRohanPass != null && !envRohanPass.isBlank())
                    ? passwordEncoder.encode(envRohanPass.trim())
                    : DEFAULT_ROHAN_HASH;

            User adminRohan = User.builder()
                    .fullName("Rohan (Admin)")
                    .email("rohan@gmail.com")
                    .phone("+919876543221")
                    .passwordHash(rohanHash)
                    .role(UserRole.ADMIN)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            User savedRohan = userRepository.save(adminRohan);
            if (firestoreUserRepository != null) {
                try { firestoreUserRepository.save(savedRohan); } catch (Exception ignored) {}
            }
            log.info("Created default admin user: rohan@gmail.com");
        }

        if (!userRepository.existsByEmail("monika@gmail.com")) {
            String envMonikaPass = System.getenv("ADMIN_MONIKA_PASSWORD");
            String monikaHash = (envMonikaPass != null && !envMonikaPass.isBlank())
                    ? passwordEncoder.encode(envMonikaPass.trim())
                    : DEFAULT_MONIKA_HASH;

            User adminMonika = User.builder()
                    .fullName("Monika (Admin)")
                    .email("monika@gmail.com")
                    .phone("+919876543222")
                    .passwordHash(monikaHash)
                    .role(UserRole.ADMIN)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            User savedMonika = userRepository.save(adminMonika);
            if (firestoreUserRepository != null) {
                try { firestoreUserRepository.save(savedMonika); } catch (Exception ignored) {}
            }
            log.info("Created default admin user: monika@gmail.com");
        }
    }
}
