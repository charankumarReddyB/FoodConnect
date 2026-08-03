package com.foodconnect.service;

import com.foodconnect.dto.request.*;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.PhoneOtpToken;
import com.foodconnect.entity.RefreshToken;
import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.*;
import com.foodconnect.security.JwtTokenProvider;
import com.foodconnect.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizationRepository organizationRepository;

    @Mock
    private VolunteerRepository volunteerRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PhoneOtpTokenRepository phoneOtpTokenRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserMapper userMapper;

    @Mock
    private com.foodconnect.service.SmsService smsService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockUser;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(UUID.randomUUID())
                .fullName("Jane Donor")
                .email("jane@foodconnect.org")
                .phone("+919876543210")
                .passwordHash("hashed_password")
                .role(UserRole.DONOR)
                .isActive(true)
                .build();

        registerRequest = RegisterRequest.builder()
                .fullName("Jane Donor")
                .email("jane@foodconnect.org")
                .phone("+919876543210")
                .password("securePassword123")
                .role(UserRole.DONOR)
                .build();
    }

    @Test
    @DisplayName("Successfully register a new donor user")
    void testRegister_Success() {
        UserResponse expectedResponse = UserResponse.builder()
                .id(mockUser.getId())
                .fullName("Jane Donor")
                .email("jane@foodconnect.org")
                .role(UserRole.DONOR)
                .build();

        when(userRepository.existsByEmail("jane@foodconnect.org")).thenReturn(false);
        when(userRepository.existsByPhone("+919876543210")).thenReturn(false);
        when(passwordEncoder.encode("securePassword123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(userMapper.toResponse(mockUser)).thenReturn(expectedResponse);

        UserResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("jane@foodconnect.org", response.getEmail());
        assertEquals(UserRole.DONOR, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Throw DuplicateResourceException when registering with duplicate email")
    void testRegister_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("jane@foodconnect.org")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Successfully login and return JWT access and refresh token")
    void testLogin_Success() {
        LoginRequest loginRequest = new LoginRequest("jane@foodconnect.org", "securePassword123");
        Authentication authentication = mock(Authentication.class);
        RefreshToken refreshToken = RefreshToken.builder()
                .token("uuid-refresh-token")
                .expiryDate(Instant.now().plusSeconds(600))
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(tokenProvider.generateToken(any())).thenReturn("jwt.mock.token");
        when(userRepository.findByEmail("jane@foodconnect.org")).thenReturn(Optional.of(mockUser));
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);
        when(userMapper.toResponse(mockUser)).thenReturn(UserResponse.builder().email("jane@foodconnect.org").build());

        JwtAuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt.mock.token", response.getAccessToken());
        assertEquals("uuid-refresh-token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
    }

    @Test
    @DisplayName("Successfully authenticate existing user via Google Sign-In")
    void testGoogleAuth_ExistingUser() {
        GoogleAuthRequest googleRequest = GoogleAuthRequest.builder()
                .googleId("google-12345")
                .email("jane@foodconnect.org")
                .fullName("Jane Donor")
                .build();

        mockUser.setGoogleId("google-12345");
        RefreshToken refreshToken = RefreshToken.builder().token("ref-token").expiryDate(Instant.now().plusSeconds(600)).build();

        when(userRepository.findByGoogleId("google-12345")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(tokenProvider.generateToken(any())).thenReturn("google.jwt.token");
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);
        when(userMapper.toResponse(mockUser)).thenReturn(UserResponse.builder().email("jane@foodconnect.org").googleId("google-12345").build());

        JwtAuthResponse response = authService.googleAuth(googleRequest);

        assertNotNull(response);
        assertEquals("google.jwt.token", response.getAccessToken());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    @DisplayName("Successfully send Phone OTP")
    void testSendPhoneOtp_Success() {
        SendOtpRequest request = new SendOtpRequest("+919876543210");
        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed_otp");
        when(phoneOtpTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(smsService.sendSms(anyString(), anyString())).thenReturn(true);

        Map<String, Object> result = authService.sendPhoneOtp(request);

        assertNotNull(result);
        assertTrue((Boolean) result.get("success"));
        assertNull(result.get("devOtpCode"));
        assertNotNull(result.get("message"));
    }

    @Test
    @DisplayName("Verify Phone OTP and authenticate user")
    void testVerifyPhoneOtp_Success() {
        VerifyOtpRequest verifyRequest = VerifyOtpRequest.builder()
                .phone("+919876543210")
                .otpCode("123456")
                .build();

        PhoneOtpToken token = PhoneOtpToken.builder()
                .phone("+919876543210")
                .otpHash("hashed_otp")
                .expiryTime(OffsetDateTime.now().plusMinutes(5))
                .attemptCount(0)
                .isVerified(false)
                .build();

        RefreshToken refreshToken = RefreshToken.builder().token("ref-token").expiryDate(Instant.now().plusSeconds(600)).build();

        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210")).thenReturn(Optional.of(token));
        when(passwordEncoder.matches("123456", "hashed_otp")).thenReturn(true);
        when(userRepository.findByPhone("+919876543210")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(tokenProvider.generateToken(any())).thenReturn("phone.jwt.token");
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);
        when(userMapper.toResponse(mockUser)).thenReturn(UserResponse.builder().phone("+919876543210").build());

        JwtAuthResponse response = authService.verifyPhoneOtp(verifyRequest);

        assertNotNull(response);
        assertEquals("phone.jwt.token", response.getAccessToken());
    }

    @Test
    @DisplayName("Throw BadRequestException on expired Phone OTP")
    void testVerifyPhoneOtp_Expired_ThrowsException() {
        VerifyOtpRequest verifyRequest = VerifyOtpRequest.builder()
                .phone("+919876543210")
                .otpCode("123456")
                .build();

        PhoneOtpToken token = PhoneOtpToken.builder()
                .phone("+919876543210")
                .otpHash("hashed_otp")
                .expiryTime(OffsetDateTime.now().minusMinutes(1))
                .build();

        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210")).thenReturn(Optional.of(token));

        assertThrows(BadRequestException.class, () -> authService.verifyPhoneOtp(verifyRequest));
    }

    @Test
    @DisplayName("Successfully authenticate user with Firebase ID Token")
    void testAuthenticateWithFirebase_Success() {
        com.foodconnect.dto.request.FirebaseTokenRequest request = com.foodconnect.dto.request.FirebaseTokenRequest.builder()
                .idToken("mock_firebase_token")
                .phone("+919876543210")
                .role(UserRole.DONOR)
                .build();

        RefreshToken refreshToken = RefreshToken.builder().token("firebase-ref-token").expiryDate(Instant.now().plusSeconds(600)).build();

        when(userRepository.findByPhone("+919876543210")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any())).thenReturn(mockUser);
        when(tokenProvider.generateToken(any())).thenReturn("firebase.jwt.token");
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);
        when(userMapper.toResponse(mockUser)).thenReturn(UserResponse.builder().phone("+919876543210").build());

        JwtAuthResponse response = authService.authenticateWithFirebase(request);

        assertNotNull(response);
        assertEquals("firebase.jwt.token", response.getAccessToken());
    }
}
