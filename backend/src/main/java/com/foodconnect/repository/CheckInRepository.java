package com.foodconnect.repository;

import com.foodconnect.entity.CheckIn;
import com.foodconnect.enums.CheckInStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckInRepository extends JpaRepository<CheckIn, UUID> {

    Optional<CheckIn> findFirstByUserIdAndCheckedInAtBetweenAndStatusOrderByCheckedInAtDesc(
            UUID userId, OffsetDateTime startOfDay, OffsetDateTime endOfDay, CheckInStatus status);

    Optional<CheckIn> findFirstByUserIdAndStatusOrderByCheckedInAtDesc(UUID userId, CheckInStatus status);

    @Query("SELECT c FROM CheckIn c WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(c.user.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.user.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.eventId) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status IS NULL OR c.status = :status) " +
           "ORDER BY c.checkedInAt DESC")
    Page<CheckIn> searchCheckIns(@Param("search") String search, @Param("status") CheckInStatus status, Pageable pageable);
}
