package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.request.DonationUpdateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.Donation;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.DonationMapper;
import com.foodconnect.repository.DonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.impl.DonationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.OffsetDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationServiceImplTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DonationMapper donationMapper;

    @InjectMocks
    private DonationServiceImpl donationService;

    private User donor;
    private Donation donation;
    private DonationResponse donationResponse;
    private UUID donorId;
    private UUID donationId;

    @BeforeEach
    void setUp() {
        donorId = UUID.randomUUID();
        donationId = UUID.randomUUID();

        donor = User.builder()
                .id(donorId)
                .email("donor@foodconnect.org")
                .fullName("Donor User")
                .role(UserRole.DONOR)
                .build();

        donation = Donation.builder()
                .id(donationId)
                .donor(donor)
                .title("Surplus Rice & Curry")
                .description("50 fresh meals prepared today")
                .foodType(FoodType.VEG)
                .quantityDescription("50 Servings")
                .estimatedServings(50)
                .preparedTime(OffsetDateTime.now())
                .expiryTime(OffsetDateTime.now().plusHours(6))
                .pickupAddress("123 MG Road, Bengaluru")
                .latitude(12.9716)
                .longitude(77.5946)
                .deliveryMethod(DeliveryMethod.VOLUNTEER_DELIVERY)
                .status(DonationStatus.CREATED)
                .images(new ArrayList<>())
                .build();

        donationResponse = DonationResponse.builder()
                .id(donationId)
                .title("Surplus Rice & Curry")
                .status(DonationStatus.CREATED)
                .estimatedServings(50)
                .build();
    }

    @Test
    @DisplayName("Create donation - Success")
    void createDonation_Success() {
        DonationCreateRequest request = DonationCreateRequest.builder()
                .title("Surplus Rice & Curry")
                .description("50 fresh meals prepared today")
                .foodType(FoodType.VEG)
                .quantityDescription("50 Servings")
                .estimatedServings(50)
                .preparedTime(OffsetDateTime.now())
                .expiryTime(OffsetDateTime.now().plusHours(6))
                .pickupAddress("123 MG Road, Bengaluru")
                .latitude(12.9716)
                .longitude(77.5946)
                .deliveryMethod(DeliveryMethod.VOLUNTEER_DELIVERY)
                .imageUrls(List.of("https://example.com/image1.jpg"))
                .build();

        when(userRepository.findById(donorId)).thenReturn(Optional.of(donor));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(donationMapper.toResponse(any(Donation.class))).thenReturn(donationResponse);

        DonationResponse result = donationService.createDonation(donorId, request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(donationId);
        verify(donationRepository, times(1)).save(any(Donation.class));
    }

    @Test
    @DisplayName("Create donation - User Not Found Failure")
    void createDonation_UserNotFound_ThrowsException() {
        DonationCreateRequest request = DonationCreateRequest.builder()
                .title("Fresh Bread")
                .build();

        when(userRepository.findById(donorId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> donationService.createDonation(donorId, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Donor not found");
    }

    @Test
    @DisplayName("Update donation - Success")
    void updateDonation_Success() {
        DonationUpdateRequest updateRequest = new DonationUpdateRequest();
        updateRequest.setFoodName("Updated Rice Bowl");
        updateRequest.setEstimatedServings(60);

        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(donationMapper.toResponse(any(Donation.class))).thenReturn(donationResponse);

        DonationResponse result = donationService.updateDonation(donationId, donorId, updateRequest);

        assertThat(result).isNotNull();
        verify(donationRepository).save(donation);
    }

    @Test
    @DisplayName("Update donation - Unauthorized Owner Failure")
    void updateDonation_Unauthorized_ThrowsException() {
        UUID otherUserId = UUID.randomUUID();
        DonationUpdateRequest updateRequest = new DonationUpdateRequest();
        updateRequest.setFoodName("Updated Title");

        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> donationService.updateDonation(donationId, otherUserId, updateRequest))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Only the donation owner can update");
    }

    @Test
    @DisplayName("Update donation - Terminal Status Failure")
    void updateDonation_TerminalStatus_ThrowsException() {
        donation.setStatus(DonationStatus.COMPLETED);
        DonationUpdateRequest updateRequest = new DonationUpdateRequest();
        updateRequest.setFoodName("Updated Title");

        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> donationService.updateDonation(donationId, donorId, updateRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot update donation in terminal status");
    }

    @Test
    @DisplayName("Delete donation - Unauthorized Failure")
    void deleteDonation_Unauthorized_ThrowsException() {
        UUID strangerId = UUID.randomUUID();
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));

        assertThatThrownBy(() -> donationService.deleteDonation(donationId, strangerId))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("Get donations by status - Success")
    void getDonationsByStatus_Success() {
        Page<Donation> page = new PageImpl<>(List.of(donation));
        when(donationRepository.findByStatus(eq(DonationStatus.CREATED), any(Pageable.class))).thenReturn(page);
        when(donationMapper.toResponse(any(Donation.class))).thenReturn(donationResponse);

        PagedResponse<DonationResponse> result = donationService.getDonationsByStatus(DonationStatus.CREATED, 0, 10);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    @DisplayName("Update donation status - Success")
    void updateDonationStatus_Success() {
        when(donationRepository.findById(donationId)).thenReturn(Optional.of(donation));
        when(donationRepository.save(any(Donation.class))).thenReturn(donation);
        when(donationMapper.toResponse(any(Donation.class))).thenReturn(donationResponse);

        DonationResponse result = donationService.updateDonationStatus(donationId, DonationStatus.COMPLETED);

        assertThat(result).isNotNull();
        assertThat(donation.getStatus()).isEqualTo(DonationStatus.COMPLETED);
    }
}
