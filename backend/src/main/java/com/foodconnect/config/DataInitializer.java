package com.foodconnect.config;

import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import com.foodconnect.repository.UserRepository;
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

    @Override
    public void run(String... args) {
        log.info("Initializing default seed data for FoodConnect...");

        if (!userRepository.existsByEmail("admin@foodconnect.in")) {
            User admin = User.builder()
                    .fullName("FoodConnect Admin India")
                    .email("admin@foodconnect.in")
                    .phone("+919876543210")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(UserRole.ADMIN)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .isActive(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("Created default Indian admin user: admin@foodconnect.in / Admin@123");
        }
    }
}
