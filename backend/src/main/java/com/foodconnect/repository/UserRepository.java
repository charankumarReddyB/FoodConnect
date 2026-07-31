package com.foodconnect.repository;

import com.foodconnect.entity.User;
import com.foodconnect.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByGoogleId(String googleId);
    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
    Boolean existsByGoogleId(String googleId);
    Page<User> findByRole(UserRole role, Pageable pageable);
}
