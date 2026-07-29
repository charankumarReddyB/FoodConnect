package com.foodconnect.service.impl;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RefreshTokenRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.RefreshTokenResponse;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.Organization;
import com.foodconnect.entity.RefreshToken;
import com.foodconnect.entity.User;
import com.foodconnect.entity.Volunteer;
import com.foodconnect.enums.OrganizationType;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.OrganizationRepository;
import com.foodconnect.repository.RefreshTokenRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.repository.VolunteerRepository;
import com.foodconnect.security.JwtTokenProvider;
import com.foodconnect.security.SecurityUtils;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final VolunteerRepository volunteerRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        log.info("Processing user registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateResourceException("Email is already registered: " + request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty() && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number is already registered: " + request.getPhone());
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.DONOR;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isActive(true)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Auto-create extension records for specialized roles
        if (role == UserRole.NGO || role == UserRole.ORPHANAGE || role == UserRole.OLD_AGE_HOME || role == UserRole.SHELTER) {
            Organization org = Organization.builder()
                    .user(savedUser)
                    .organizationName(request.getOrganizationName() != null ? request.getOrganizationName() : request.getFullName())
                    .orgType(mapRoleToOrgType(role))
                    .registrationNumber(request.getRegistrationNumber())
                    .contactPerson(request.getFullName())
                    .contactEmail(request.getEmail())
                    .contactPhone(request.getPhone() != null ? request.getPhone() : "")
                    .address(request.getAddress() != null ? request.getAddress() : "Location Pending")
                    .latitude(request.getLatitude() != null ? request.getLatitude() : 0.0)
                    .longitude(request.getLongitude() != null ? request.getLongitude() : 0.0)
                    .isVerified(false)
                    .build();
            organizationRepository.save(org);
        } else if (role == UserRole.VOLUNTEER) {
            Volunteer volunteer = Volunteer.builder()
                    .user(savedUser)
                    .vehicleType(request.getVehicleType() != null ? request.getVehicleType() : "BICYCLE")
                    .isAvailable(true)
                    .currentLatitude(request.getLatitude())
                    .currentLongitude(request.getLongitude())
                    .rating(5.00)
                    .completedDeliveriesCount(0)
                    .build();
            volunteerRepository.save(volunteer);
        }

        log.info("Successfully registered user: {} with role: {}", savedUser.getEmail(), savedUser.getRole());

        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    public JwtAuthResponse login(LoginRequest request) {
        log.info("Attempting authentication for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (!user.getIsActive()) {
            throw new BadRequestException("User account is deactivated. Please contact support.");
        }

        RefreshToken refreshToken = createRefreshToken(user);

        log.info("User authenticated successfully: {}", user.getEmail());

        return JwtAuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not found in database."));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token was expired. Please make a new signin request.");
        }

        User user = token.getUser();
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        String newAccessToken = tokenProvider.generateToken(authentication);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(token.getToken())
                .tokenType("Bearer")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return userMapper.toResponse(user);
    }

    @Override
    public void logout(String token) {
        SecurityContextHolder.clearContext();
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusSeconds(604800)) // 7 Days
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private OrganizationType mapRoleToOrgType(UserRole role) {
        return switch (role) {
            case NGO -> OrganizationType.NGO;
            case ORPHANAGE -> OrganizationType.ORPHANAGE;
            case OLD_AGE_HOME -> OrganizationType.OLD_AGE_HOME;
            case SHELTER -> OrganizationType.SHELTER;
            default -> OrganizationType.OTHER;
        };
    }
}
