package com.foodconnect.config;

import com.foodconnect.entity.Role;
import com.foodconnect.entity.User;
import com.foodconnect.enums.RoleName;
import com.foodconnect.repository.RoleRepository;
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

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing default roles and admin account for FoodConnect India...");

        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = Role.builder().name(roleName).build();
                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }

        if (!userRepository.existsByEmail("admin@foodconnect.in")) {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseThrow();
            User admin = User.builder()
                    .name("FoodConnect Admin India")
                    .email("admin@foodconnect.in")
                    .phone("+919876543210")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(adminRole)
                    .address("100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038")
                    .latitude(12.9716)
                    .longitude(77.5946)
                    .active(true)
                    .build();

            userRepository.save(admin);
            log.info("Created default Indian admin user: admin@foodconnect.in / Admin@123");
        }
    }
}
