package com.foodconnect.repository;

import com.foodconnect.entity.Donation;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DonationRepository extends JpaRepository<Donation, UUID> {
    Page<Donation> findByDonorId(UUID donorId, Pageable pageable);
    Page<Donation> findByStatus(DonationStatus status, Pageable pageable);
    List<Donation> findByStatusAndExpiryTimeBefore(DonationStatus status, OffsetDateTime now);

    @Query("SELECT d FROM Donation d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:foodType IS NULL OR d.foodType = :foodType) AND " +
           "d.expiryTime > CURRENT_TIMESTAMP " +
           "ORDER BY d.createdAt DESC")
    Page<Donation> findActiveDonations(@Param("status") DonationStatus status,
                                      @Param("foodType") FoodType foodType,
                                      Pageable pageable);
}
