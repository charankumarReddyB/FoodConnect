package com.foodconnect.service;

import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.entity.Delivery;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.User;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.enums.DeliveryStatus;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DeliveryRepository;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.VolunteerRepository;
import com.foodconnect.service.impl.DeliveryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceImplTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @InjectMocks
    private DeliveryServiceImpl deliveryService;

    private UUID donationId;
    private UUID volunteerUserId;
    private UUID deliveryId;
    private User volunteerUser;
    private Volunteer volunteer;
    private Donation donation;
    private Delivery delivery;

    @BeforeEach
    void setUp() {
        donationId = UUID.randomUUID();
        volunteerUserId = UUID.randomUUID();
        deliveryId = UUID.randomUUID();

        volunteerUser = User.builder()
                .id(volunteerUserId)
                .email("volunteer@foodconnect.org")
                .role(UserRole.VOLUNTEER)
                .build();

        volunteer = Volunteer.builder()
                .id(UUID.randomUUID())
                .user(volunteerUser)
                .build();

        donation = Donation.builder()
                .id(donationId)
                .title("Surplus Bread")
                .status(DonationStatus.ACCEPTED)
                .build();

        delivery = Delivery.builder()
                .id(deliveryId)
                .donation(donation)
                .volunteer(volunteer)
                .status(DeliveryStatus.ASSIGNED)
                .pickupVerificationCode("1234")
                .deliveryVerificationCode("5678")
                .build();
    }

    @Test
    @DisplayName("Claim delivery - Success")
    void claimDelivery_Success() {
        when(volunteerRepository.findByUserId(volunteerUserId)).thenReturn(Optional.of(volunteer));
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));
        when(deliveryRepository.findByDonationId(donationId)).thenReturn(Optional.empty());
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> {
            Delivery d = i.getArgument(0);
            d.setId(deliveryId);
            return d;
        });

        DeliveryResponse response = deliveryService.claimDelivery(donationId, volunteerUserId);

        assertThat(response).isNotNull();
        assertThat(donation.getStatus()).isEqualTo(DonationStatus.VOLUNTEER_ASSIGNED);
        verify(deliveryRepository, times(1)).save(any(Delivery.class));
    }

    @Test
    @DisplayName("Claim delivery - Terminal Status Failure")
    void claimDelivery_UnacceptedStatus_ThrowsException() {
        donation.setStatus(DonationStatus.COMPLETED);
        when(volunteerRepository.findByUserId(volunteerUserId)).thenReturn(Optional.of(volunteer));
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> deliveryService.claimDelivery(donationId, volunteerUserId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be claimed for delivery");
    }

    @Test
    @DisplayName("Update delivery status - Pickup with Valid PIN Success")
    void updateDeliveryStatus_Pickup_Success() {
        when(deliveryRepository.findById(deliveryId)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenReturn(delivery);

        DeliveryResponse response = deliveryService.updateDeliveryStatus(deliveryId, volunteerUserId, DeliveryStatus.PICKED_UP, "1234");

        assertThat(response).isNotNull();
        assertThat(delivery.getStatus()).isEqualTo(DeliveryStatus.PICKED_UP);
        assertThat(donation.getStatus()).isEqualTo(DonationStatus.PICKED_UP);
    }

    @Test
    @DisplayName("Update delivery status - Invalid PIN Failure")
    void updateDeliveryStatus_InvalidPin_ThrowsException() {
        when(deliveryRepository.findById(deliveryId)).thenReturn(Optional.of(delivery));

        assertThatThrownBy(() -> deliveryService.updateDeliveryStatus(deliveryId, volunteerUserId, DeliveryStatus.PICKED_UP, "9999"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid pickup verification PIN");
    }

    @Test
    @DisplayName("Update delivery status - Unauthorized Volunteer Failure")
    void updateDeliveryStatus_UnauthorizedVolunteer_ThrowsException() {
        UUID otherVolunteer = UUID.randomUUID();
        when(deliveryRepository.findById(deliveryId)).thenReturn(Optional.of(delivery));

        assertThatThrownBy(() -> deliveryService.updateDeliveryStatus(deliveryId, otherVolunteer, DeliveryStatus.DELIVERED, "5678"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("assigned volunteer can update");
    }
}
