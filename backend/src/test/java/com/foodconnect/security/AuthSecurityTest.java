package com.foodconnect.security;

import com.foodconnect.dto.request.SendOtpRequest;
import com.foodconnect.dto.request.VerifyOtpRequest;
import com.foodconnect.entity.PhoneOtpToken;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.repository.PhoneOtpTokenRepository;
import com.foodconnect.repository.RefreshTokenRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.SmsService;
import com.foodconnect.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PhoneOtpTokenRepository phoneOtpTokenRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private AuthServiceImpl authService;

    private PhoneOtpToken sampleToken;

    @BeforeEach
    void setUp() {
        sampleToken = PhoneOtpToken.builder()
                .id(UUID.randomUUID())
                .phone("+919876543210")
                .otpHash("hashed_otp_code")
                .expiryTime(OffsetDateTime.now().plusMinutes(5))
                .attemptCount(0)
                .isVerified(false)
                .lastRequestedAt(OffsetDateTime.now().minusMinutes(2))
                .requestCount(1)
                .build();
    }

    @Test
    @DisplayName("SECURITY TEST: Reject reused OTP token attempt (Replay Attack Prevention)")
    void testVerifyPhoneOtp_ReusedOtp_ThrowsException() {
        sampleToken.setIsVerified(true);
        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210"))
                .thenReturn(Optional.of(sampleToken));

        VerifyOtpRequest request = VerifyOtpRequest.builder()
                .phone("+919876543210")
                .otpCode("123456")
                .build();

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.verifyPhoneOtp(request));
        assertTrue(exception.getMessage().contains("already been used"));
    }

    @Test
    @DisplayName("SMS DELIVERY TEST: Verify SMS service is invoked when OTP is requested")
    void testSendPhoneOtp_InvokesSmsService() {
        SendOtpRequest request = new SendOtpRequest("+919876543210");
        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed_otp_code");
        when(phoneOtpTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Map<String, Object> result = authService.sendPhoneOtp(request);

        assertNotNull(result);
        assertTrue((Boolean) result.get("success"));
        verify(smsService, times(1)).sendSms(eq("+919876543210"), anyString());
    }

    @Test
    @DisplayName("RATE LIMIT TEST: Reject OTP request during 60-second cooldown period")
    void testSendPhoneOtp_CooldownEnforced_ThrowsException() {
        sampleToken.setLastRequestedAt(OffsetDateTime.now().minusSeconds(10)); // requested 10s ago
        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210"))
                .thenReturn(Optional.of(sampleToken));

        SendOtpRequest request = new SendOtpRequest("+919876543210");
        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.sendPhoneOtp(request));
        assertTrue(exception.getMessage().contains("Please wait"));
    }

    @Test
    @DisplayName("BRUTE-FORCE TEST: Reject OTP verification after 5 failed attempts")
    void testVerifyPhoneOtp_MaxAttempts_ThrowsException() {
        sampleToken.setAttemptCount(5);
        when(phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc("+919876543210"))
                .thenReturn(Optional.of(sampleToken));

        VerifyOtpRequest request = VerifyOtpRequest.builder()
                .phone("+919876543210")
                .otpCode("999999")
                .build();

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.verifyPhoneOtp(request));
        assertTrue(exception.getMessage().contains("Too many incorrect OTP attempts"));
    }
}
