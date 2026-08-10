package com.foodconnect.repository;

import com.foodconnect.entity.Donation;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.foodconnect.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ActiveProfiles("dev")
class DatabaseIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Test
    @DisplayName("Persist and Retrieve User and Donation - Foreign Key Integrity")
    void persistUserAndDonation_Success() {
        User donor = User.builder()
                .email("test.donor@foodconnect.org")
                .fullName("Test Donor")
                .phone("+919988776655")
                .role(UserRole.DONOR)
                .build();

        User savedUser = userRepository.save(donor);
        assertThat(savedUser.getId()).isNotNull();

        Donation donation = Donation.builder()
                .donor(savedUser)
                .title("Surplus Biryani")
                .description("Delicious chicken biryani")
                .foodType(FoodType.NON_VEG)
                .quantityDescription("10 Servings")
                .estimatedServings(10)
                .preparedTime(OffsetDateTime.now())
                .expiryTime(OffsetDateTime.now().plusHours(4))
                .pickupAddress("Koramangala, Bengaluru")
                .latitude(12.9352)
                .longitude(77.6245)
                .deliveryMethod(DeliveryMethod.VOLUNTEER_DELIVERY)
                .status(DonationStatus.CREATED)
                .build();

        Donation savedDonation = donationRepository.save(donation);
        assertThat(savedDonation.getId()).isNotNull();

        Optional<Donation> fetched = donationRepository.findById(savedDonation.getId());
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getDonor().getEmail()).isEqualTo("test.donor@foodconnect.org");
    }

    @Test
    @DisplayName("Unique Constraint - Duplicate Email Throws Exception")
    void duplicateEmail_ThrowsDataIntegrityException() {
        User user1 = User.builder()
                .email("duplicate@foodconnect.org")
                .fullName("User One")
                .role(UserRole.DONOR)
                .build();

        userRepository.saveAndFlush(user1);

        User user2 = User.builder()
                .email("duplicate@foodconnect.org")
                .fullName("User Two")
                .role(UserRole.NGO)
                .build();

        assertThatThrownBy(() -> userRepository.saveAndFlush(user2))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
