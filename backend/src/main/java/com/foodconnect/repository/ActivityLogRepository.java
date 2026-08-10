package com.foodconnect.repository;

import com.foodconnect.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    Page<ActivityLog> findByUserId(UUID userId, Pageable pageable);
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
