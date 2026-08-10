package com.foodconnect.service;

import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.DonationRequest;
import com.foodconnect.entity.Organization;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.RequestStatus;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.DonationRequestRepository;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.service.impl.DonationRequestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationRequestServiceImplTest {

    @Mock
    private DonationRequestRepository donationRequestRepository;

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private com.foodconnect.repository.VolunteerRepository volunteerRepository;

    @Mock
    private com.foodconnect.service.FcmService fcmService;

    @InjectMocks
    private DonationRequestServiceImpl donationRequestService;

    private UUID recipientUserId;
    private UUID donorUserId;
    private UUID donationId;
    private UUID requestId;
    private Organization recipientOrg;
    private User donor;
    private Donation donation;
    private DonationRequest donationRequest;

    @BeforeEach
    void setUp() {
        recipientUserId = UUID.randomUUID();
        donorUserId = UUID.randomUUID();
        donationId = UUID.randomUUID();
        requestId = UUID.randomUUID();

        recipientOrg = Organization.builder()
                .id(UUID.randomUUID())
                .organizationName("Helping Hands NGO")
                .user(User.builder().id(recipientUserId).build())
                .build();

        donor = User.builder()
                .id(donorUserId)
                .email("donor@foodconnect.org")
                .role(UserRole.DONOR)
                .build();

        donation = Donation.builder()
                .id(donationId)
                .donor(donor)
                .title("Fresh Meals")
                .estimatedServings(30)
                .status(DonationStatus.CREATED)
                .build();

        donationRequest = DonationRequest.builder()
                .id(requestId)
                .donation(donation)
                .recipient(recipientOrg)
                .requestedServings(30)
                .status(RequestStatus.PENDING)
                .requestTime(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Request donation - Success")
    void requestDonation_Success() {
        when(organizationRepository.findByUserId(recipientUserId)).thenReturn(Optional.of(recipientOrg));
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));
        when(donationRequestRepository.existsByDonationIdAndRecipientId(donationId, recipientOrg.getId())).thenReturn(false);
        when(donationRequestRepository.save(any(DonationRequest.class))).thenReturn(donationRequest);

        DonationRequestResponse response = donationRequestService.requestDonation(donationId, recipientUserId, 30, "Urgent need");

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(RequestStatus.PENDING);
        assertThat(donation.getStatus()).isEqualTo(DonationStatus.REQUESTED);
        verify(donationRepository).save(donation);
    }

    @Test
    @DisplayName("Request donation - Duplicate Request Failure")
    void requestDonation_DuplicateRequest_ThrowsException() {
        when(organizationRepository.findByUserId(recipientUserId)).thenReturn(Optional.of(recipientOrg));
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));
        when(donationRequestRepository.existsByDonationIdAndRecipientId(donationId, recipientOrg.getId())).thenReturn(true);

        assertThatThrownBy(() -> donationRequestService.requestDonation(donationId, recipientUserId, 30, "Urgent"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already submitted a request");
    }

    @Test
    @DisplayName("Request donation - Unavailable Status Failure")
    void requestDonation_UnavailableStatus_ThrowsException() {
        donation.setStatus(DonationStatus.COMPLETED);
        when(organizationRepository.findByUserId(recipientUserId)).thenReturn(Optional.of(recipientOrg));
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> donationRequestService.requestDonation(donationId, recipientUserId, 30, "Urgent"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("no longer available");
    }

    @Test
    @DisplayName("Respond to request - Accept Success & Auto Reject Others")
    void respondToRequest_Accept_Success() {
        DonationRequest otherRequest = DonationRequest.builder()
                .id(UUID.randomUUID())
                .donation(donation)
                .recipient(Organization.builder().id(UUID.randomUUID()).build())
                .status(RequestStatus.PENDING)
                .build();

        when(donationRequestRepository.findById(requestId)).thenReturn(Optional.of(donationRequest));
        when(donationRequestRepository.findByDonationIdAndStatus(donationId, RequestStatus.PENDING))
                .thenReturn(List.of(donationRequest, otherRequest));
        when(donationRequestRepository.save(any(DonationRequest.class))).thenAnswer(i -> i.getArgument(0));

        DonationRequestResponse response = donationRequestService.respondToRequest(requestId, donorUserId, RequestStatus.ACCEPTED);

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(RequestStatus.ACCEPTED);
        assertThat(donation.getStatus()).isEqualTo(DonationStatus.ACCEPTED);
        assertThat(otherRequest.getStatus()).isEqualTo(RequestStatus.REJECTED);
    }

    @Test
    @DisplayName("Respond to request - Unauthorized Donor Failure")
    void respondToRequest_UnauthorizedDonor_ThrowsException() {
        UUID randomUser = UUID.randomUUID();
        when(donationRequestRepository.findById(requestId)).thenReturn(Optional.of(donationRequest));

        assertThatThrownBy(() -> donationRequestService.respondToRequest(requestId, randomUser, RequestStatus.ACCEPTED))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only the donation owner can accept or reject");
    }
}
