package com.foodconnect.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodconnect.dto.request.DonationCreateRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.User;
import com.foodconnect.enums.DeliveryMethod;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import com.foodconnect.enums.UserRole;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DonationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class DonationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DonationService donationService;

    private UUID donorId;
    private UserPrincipal donorPrincipal;

    @BeforeEach
    void setUp() {
        donorId = UUID.randomUUID();
        User donorUser = User.builder()
                .id(donorId)
                .email("donor@foodconnect.org")
                .fullName("Donor User")
                .passwordHash("encodedPassword")
                .phone("+919876543210")
                .role(UserRole.DONOR)
                .isActive(true)
                .build();
        donorPrincipal = UserPrincipal.create(donorUser);
        
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                donorPrincipal, null, donorPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("GET /api/v1/donations/{id} - Details Fetch Success")
    void getDonationById_Success() throws Exception {
        UUID donationId = UUID.randomUUID();
        DonationResponse response = DonationResponse.builder()
                .id(donationId)
                .title("Fresh Meals")
                .status(DonationStatus.CREATED)
                .build();

        when(donationService.getDonationById(donationId)).thenReturn(response);

        mockMvc.perform(get("/api/v1/donations/{id}", donationId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Fresh Meals"));
    }

    @Test
    @DisplayName("POST /api/v1/donations - Authenticated Donor Role Success")
    void createDonation_DonorRole_Success() throws Exception {
        DonationCreateRequest request = DonationCreateRequest.builder()
                .title("Surplus Rice Bowls")
                .description("Freshly cooked rice bowls")
                .foodType(FoodType.VEG)
                .quantityDescription("20 Servings")
                .estimatedServings(20)
                .preparedTime(OffsetDateTime.now())
                .expiryTime(OffsetDateTime.now().plusHours(4))
                .pickupAddress("MG Road, Bengaluru")
                .latitude(12.9716)
                .longitude(77.5946)
                .deliveryMethod(DeliveryMethod.VOLUNTEER_DELIVERY)
                .build();

        DonationResponse response = DonationResponse.builder()
                .id(UUID.randomUUID())
                .title("Surplus Rice Bowls")
                .status(DonationStatus.CREATED)
                .build();

        when(donationService.createDonation(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/donations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Surplus Rice Bowls"));
    }
}
