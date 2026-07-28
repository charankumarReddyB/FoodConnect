package com.foodconnect.repository;

import com.foodconnect.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
    List<Notification> findByUserIdAndReadStatusFalse(Long userId);
    long countByUserIdAndReadStatusFalse(Long userId);
}
