package com.foodconnect.repository;

import com.foodconnect.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, Long> {
    Optional<Settings> findByKeyName(String keyName);
    Boolean existsByKeyName(String keyName);
}
