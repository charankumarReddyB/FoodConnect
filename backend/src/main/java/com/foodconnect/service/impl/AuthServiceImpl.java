package com.foodconnect.service.impl;

import com.foodconnect.dto.request.*;
import com.foodconnect.dto.response.JwtAuthResponse;
import com.foodconnect.dto.response.RefreshTokenResponse;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.*;
import com.foodconnect.enums.OrganizationType;
import com.foodconnect.enums.UserRole;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.*;
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

import java.security.SecureRandom;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final VolunteerRepository volunteerRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PhoneOtpTokenRepository phoneOtpTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final com.foodconnect.service.SmsService smsService;

    private static final SecureRandom RANDOM = new SecureRandom();

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
                .phoneVerified(false)
                .authProviders("EMAIL")
                .build();

        User savedUser = userRepository.save(user);
        createExtensionRecordsIfNecessary(savedUser, role, request.getOrganizationName(), request.getRegistrationNumber(), request.getVehicleType());

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
    public JwtAuthResponse googleAuth(GoogleAuthRequest request) {
        log.info("Processing Google authentication for email: {}, googleId: {}", request.getEmail(), request.getGoogleId());

        String email = request.getEmail().toLowerCase().trim();
        Optional<User> existingUserByGoogleId = userRepository.findByGoogleId(request.getGoogleId());
        User user;

        if (existingUserByGoogleId.isPresent()) {
            user = existingUserByGoogleId.get();
            if (request.getFullName() != null && !request.getFullName().isBlank()) {
                user.setFullName(request.getFullName());
            }
            if (request.getProfileImageUrl() != null && !request.getProfileImageUrl().isBlank()) {
                user.setProfileImageUrl(request.getProfileImageUrl());
            }
            user = userRepository.save(user);
        } else {
            Optional<User> existingUserByEmail = userRepository.findByEmail(email);
            if (existingUserByEmail.isPresent()) {
                // Link Google account to existing user by email
                user = existingUserByEmail.get();
                user.setGoogleId(request.getGoogleId());
                user.setEmailVerified(true);
                String updatedProviders = appendProvider(user.getAuthProviders(), "GOOGLE");
                user.setAuthProviders(updatedProviders);
                user = userRepository.save(user);
                log.info("Linked Google account to existing user: {}", email);
            } else {
                // Create new Google User
                UserRole role = request.getRole() != null ? request.getRole() : UserRole.DONOR;
                user = User.builder()
                        .email(email)
                        .googleId(request.getGoogleId())
                        .fullName(request.getFullName() != null ? request.getFullName() : email.split("@")[0])
                        .profileImageUrl(request.getProfileImageUrl())
                        .role(role)
                        .isActive(true)
                        .emailVerified(true)
                        .phoneVerified(false)
                        .authProviders("GOOGLE")
                        .build();

                user = userRepository.save(user);
                createExtensionRecordsIfNecessary(user, role, null, null, null);
                log.info("Created new user via Google Sign-In: {}", email);
            }
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("User account is deactivated. Please contact support.");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        return JwtAuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> sendPhoneOtp(SendOtpRequest request) {
        String phone = request.getPhone().trim();
        log.info("Requesting OTP for phone number: {}", phone);

        Optional<PhoneOtpToken> existingTokenOpt = phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc(phone);
        OffsetDateTime now = OffsetDateTime.now();

        if (existingTokenOpt.isPresent()) {
            PhoneOtpToken existingToken = existingTokenOpt.get();
            // Check 60-second resend cooldown
            if (existingToken.getLastRequestedAt() != null && existingToken.getLastRequestedAt().plusSeconds(60).isAfter(now)) {
                long secondsLeft = java.time.Duration.between(now, existingToken.getLastRequestedAt().plusSeconds(60)).getSeconds();
                throw new BadRequestException("Please wait " + Math.max(1, secondsLeft) + " seconds before requesting another OTP.");
            }

            // Check rate limiting (max 5 requests in 10 minutes)
            if (existingToken.getLastRequestedAt() != null && existingToken.getLastRequestedAt().plusMinutes(10).isAfter(now)) {
                if (existingToken.getRequestCount() >= 5) {
                    throw new BadRequestException("Maximum OTP limit reached for this number. Please try again after 10 minutes.");
                }
            }
        }

        // Generate 6-digit OTP
        int otpInt = 100000 + RANDOM.nextInt(900000);
        String otpCode = String.valueOf(otpInt);
        String hashedOtp = passwordEncoder.encode(otpCode);

        PhoneOtpToken token = existingTokenOpt.orElseGet(() -> PhoneOtpToken.builder().phone(phone).build());
        token.setPhone(phone);
        token.setOtpHash(hashedOtp);
        token.setExpiryTime(now.plusMinutes(5));
        token.setAttemptCount(0);
        token.setIsVerified(false);
        token.setLastRequestedAt(now);
        token.setRequestCount(existingTokenOpt.isPresent() && existingTokenOpt.get().getLastRequestedAt().plusMinutes(10).isAfter(now)
                ? existingTokenOpt.get().getRequestCount() + 1 : 1);

        phoneOtpTokenRepository.save(token);

        log.info("OTP generated for phone {}: [SECURE - OTP code sent]", phone);
        smsService.sendSms(phone, "Your FoodConnect verification code is: " + otpCode + ". Valid for 5 minutes.");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OTP sent successfully to " + phone + ". Valid for 5 minutes.");
        response.put("expiresInSeconds", 300);
        response.put("cooldownSeconds", 60);

        // Include otpCode in response for testing/dev environment convenience
        response.put("devOtpCode", otpCode);

        return response;
    }

    @Override
    @Transactional
    public JwtAuthResponse verifyPhoneOtp(VerifyOtpRequest request) {
        String phone = request.getPhone().trim();
        String otpCode = request.getOtpCode().trim();
        log.info("Verifying OTP for phone: {}", phone);

        PhoneOtpToken token = phoneOtpTokenRepository.findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new BadRequestException("No active OTP request found for phone: " + phone));

        if (Boolean.TRUE.equals(token.getIsVerified())) {
            throw new BadRequestException("This OTP code has already been used. Please request a new OTP.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (token.getExpiryTime().isBefore(now)) {
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }

        if (token.getAttemptCount() >= 5) {
            throw new BadRequestException("Too many incorrect OTP attempts. Please request a new OTP.");
        }

        token.setAttemptCount(token.getAttemptCount() + 1);
        phoneOtpTokenRepository.save(token);

        if (!passwordEncoder.matches(otpCode, token.getOtpHash())) {
            throw new BadRequestException("Invalid OTP code. Please check and try again.");
        }

        token.setIsVerified(true);
        phoneOtpTokenRepository.save(token);

        // Account Resolution / Creation
        Optional<User> userByPhone = userRepository.findByPhone(phone);
        User user;

        if (userByPhone.isPresent()) {
            user = userByPhone.get();
            user.setPhoneVerified(true);
            user = userRepository.save(user);
        } else if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            user = userRepository.findByEmail(request.getEmail().toLowerCase().trim()).get();
            user.setPhone(phone);
            user.setPhoneVerified(true);
            user.setAuthProviders(appendProvider(user.getAuthProviders(), "PHONE"));
            user = userRepository.save(user);
        } else {
            // New user registration via Phone OTP
            UserRole role = request.getRole() != null ? request.getRole() : UserRole.DONOR;
            String generatedEmail = request.getEmail() != null && !request.getEmail().isBlank()
                    ? request.getEmail().toLowerCase().trim()
                    : "phone_" + phone.replaceAll("[^0-9]", "") + "@foodconnect.app";

            user = User.builder()
                    .phone(phone)
                    .phoneVerified(true)
                    .email(generatedEmail)
                    .fullName(request.getFullName() != null && !request.getFullName().isBlank() ? request.getFullName() : "User " + phone.substring(Math.max(0, phone.length() - 4)))
                    .role(role)
                    .isActive(true)
                    .emailVerified(false)
                    .authProviders("PHONE")
                    .build();

            user = userRepository.save(user);
            createExtensionRecordsIfNecessary(user, role, null, null, null);
            log.info("Created new user via Phone OTP: {}", phone);
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("User account is deactivated. Please contact support.");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        RefreshToken refreshToken = createRefreshToken(user);

        return JwtAuthResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        log.info("Forgot password requested for email: {}", email);

        Optional<User> userOpt = userRepository.findByEmail(email);
        Map<String, Object> response = new HashMap<>();

        if (userOpt.isPresent()) {
            passwordResetTokenRepository.deleteByEmail(email);

            int tokenInt = 100000 + RANDOM.nextInt(900000);
            String resetTokenStr = String.valueOf(tokenInt);

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .email(email)
                    .tokenHash(passwordEncoder.encode(resetTokenStr))
                    .expiryTime(OffsetDateTime.now().plusMinutes(15))
                    .isUsed(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            response.put("success", true);
            response.put("message", "Password reset instructions and verification code sent to " + email);
            response.put("devResetToken", resetTokenStr);
        } else {
            response.put("success", true);
            response.put("message", "If an account exists for " + email + ", password reset instructions have been sent.");
        }

        return response;
    }

    @Override
    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        log.info("Attempting password reset");

        PasswordResetToken token = passwordResetTokenRepository.findAll().stream()
                .filter(t -> !t.getIsUsed() && t.getExpiryTime().isAfter(OffsetDateTime.now()))
                .filter(t -> passwordEncoder.matches(request.getResetToken().trim(), t.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));

        User user = userRepository.findByEmail(token.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + token.getEmail()));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        String updatedProviders = appendProvider(user.getAuthProviders(), "EMAIL");
        user.setAuthProviders(updatedProviders);
        userRepository.save(user);

        token.setIsUsed(true);
        passwordResetTokenRepository.save(token);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password has been reset successfully. You may now log in with your new password.");
        return response;
    }

    @Override
    @Transactional
    public UserResponse linkAccount(LinkAccountRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String provider = request.getProvider().toUpperCase();
        log.info("Linking provider {} for user ID {}", provider, userId);

        if ("GOOGLE".equals(provider)) {
            if (request.getGoogleId() == null || request.getGoogleId().isBlank()) {
                throw new BadRequestException("Google ID is required to link Google account.");
            }
            user.setGoogleId(request.getGoogleId());
            user.setAuthProviders(appendProvider(user.getAuthProviders(), "GOOGLE"));
        } else if ("PHONE".equals(provider)) {
            if (request.getPhone() == null || request.getPhone().isBlank()) {
                throw new BadRequestException("Phone number is required to link phone account.");
            }
            user.setPhone(request.getPhone().trim());
            user.setPhoneVerified(true);
            user.setAuthProviders(appendProvider(user.getAuthProviders(), "PHONE"));
        } else if ("EMAIL".equals(provider)) {
            if (request.getEmail() == null || request.getPassword() == null) {
                throw new BadRequestException("Email and password are required to link email login.");
            }
            user.setEmail(request.getEmail().toLowerCase().trim());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setAuthProviders(appendProvider(user.getAuthProviders(), "EMAIL"));
        }

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
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

    private String appendProvider(String currentProviders, String provider) {
        if (currentProviders == null || currentProviders.isBlank()) {
            return provider;
        }
        if (!currentProviders.contains(provider)) {
            return currentProviders + "," + provider;
        }
        return currentProviders;
    }

    private void createExtensionRecordsIfNecessary(User savedUser, UserRole role, String orgName, String regNum, String vehicleType) {
        if (role == UserRole.NGO || role == UserRole.ORPHANAGE || role == UserRole.OLD_AGE_HOME || role == UserRole.SHELTER) {
            Organization org = Organization.builder()
                    .user(savedUser)
                    .organizationName(orgName != null ? orgName : savedUser.getFullName())
                    .orgType(mapRoleToOrgType(role))
                    .registrationNumber(regNum)
                    .contactPerson(savedUser.getFullName())
                    .contactEmail(savedUser.getEmail())
                    .contactPhone(savedUser.getPhone() != null ? savedUser.getPhone() : "")
                    .address(savedUser.getAddress() != null ? savedUser.getAddress() : "Location Pending")
                    .latitude(savedUser.getLatitude() != null ? savedUser.getLatitude() : 0.0)
                    .longitude(savedUser.getLongitude() != null ? savedUser.getLongitude() : 0.0)
                    .isVerified(false)
                    .build();
            organizationRepository.save(org);
        } else if (role == UserRole.VOLUNTEER) {
            Volunteer volunteer = Volunteer.builder()
                    .user(savedUser)
                    .vehicleType(vehicleType != null ? vehicleType : "BICYCLE")
                    .isAvailable(true)
                    .currentLatitude(savedUser.getLatitude())
                    .currentLongitude(savedUser.getLongitude())
                    .rating(5.00)
                    .completedDeliveriesCount(0)
                    .build();
            volunteerRepository.save(volunteer);
        }
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
