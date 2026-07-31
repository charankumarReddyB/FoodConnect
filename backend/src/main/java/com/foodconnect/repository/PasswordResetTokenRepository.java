package com.foodconnect.repository;

import com.foodconnect.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByEmail(String email);
}
