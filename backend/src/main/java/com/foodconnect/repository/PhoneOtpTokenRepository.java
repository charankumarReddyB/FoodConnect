package com.foodconnect.repository;

import com.foodconnect.entity.PhoneOtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PhoneOtpTokenRepository extends JpaRepository<PhoneOtpToken, UUID> {
    Optional<PhoneOtpToken> findTopByPhoneOrderByCreatedAtDesc(String phone);
    void deleteByPhone(String phone);
}
