package com.foodconnect.service.impl;

import com.foodconnect.dto.request.LocationUpdateRequest;
import com.foodconnect.dto.request.UserProfileUpdateRequest;
import com.foodconnect.dto.response.UserResponse;
import com.foodconnect.entity.User;
import com.foodconnect.entity.UserLocation;
import com.foodconnect.exception.DuplicateResourceException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.mapper.UserMapper;
import com.foodconnect.repository.UserLocationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserLocationRepository userLocationRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new DuplicateResourceException("Phone number is already in use.");
            }
            user.setPhone(request.getPhone());
        }
        if (request.getProfileImage() != null) user.setProfileImage(request.getProfileImage());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getLatitude() != null) user.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) user.setLongitude(request.getLongitude());

        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse updateLocation(Long userId, LocationUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        User updated = userRepository.save(user);

        UserLocation location = UserLocation.builder()
                .user(updated)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
        userLocationRepository.save(location);

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void deactivateAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(false);
        userRepository.save(user);
    }
}
