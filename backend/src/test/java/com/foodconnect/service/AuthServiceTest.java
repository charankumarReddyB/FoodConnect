package com.foodconnect.service;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.RefreshToken;
import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.repository.RefreshTokenRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.VolunteerRepository;
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
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserMapper userMapper;

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
        when(tokenProvider.generateToken(authentication)).thenReturn("jwt.mock.token");
        when(userRepository.findByEmail("jane@foodconnect.org")).thenReturn(Optional.of(mockUser));
        when(refreshTokenRepository.save(any())).thenReturn(refreshToken);
        when(userMapper.toResponse(mockUser)).thenReturn(UserResponse.builder().email("jane@foodconnect.org").build());

        JwtAuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt.mock.token", response.getAccessToken());
        assertEquals("uuid-refresh-token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
    }
}
