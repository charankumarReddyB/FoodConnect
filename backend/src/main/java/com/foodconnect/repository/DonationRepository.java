package com.foodconnect.repository;

import com.foodconnect.entity.Donation;
import com.foodconnect.enums.DonationStatus;
import com.foodconnect.enums.FoodCategory;
import com.foodconnect.enums.VegNonVeg;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Page<Donation> findByDonorId(Long donorId, Pageable pageable);
    Page<Donation> findByStatus(DonationStatus status, Pageable pageable);

    @Query(value = "SELECT d.*, " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(d.latitude)))) AS distance " +
           "FROM donations d " +
           "WHERE (:status IS NULL OR d.status = :status) " +
           "AND (:category IS NULL OR d.category = :category) " +
           "AND (:vegNonVeg IS NULL OR d.veg_nonveg = :vegNonVeg) " +
           "HAVING (6371 * acos(cos(radians(:lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:lon)) + sin(radians(:lat)) * sin(radians(d.latitude)))) <= :radiusKm " +
           "ORDER BY distance ASC", 
           nativeQuery = true)
    List<Donation> findNearbyDonations(@Param("lat") double lat, 
                                      @Param("lon") double lon, 
                                      @Param("radiusKm") double radiusKm,
                                      @Param("status") String status,
                                      @Param("category") String category,
                                      @Param("vegNonVeg") String vegNonVeg);

    @Query("SELECT d FROM Donation d WHERE " +
           "(:category IS NULL OR d.category = :category) AND " +
           "(:vegNonVeg IS NULL OR d.vegNonVeg = :vegNonVeg) AND " +
           "(:status IS NULL OR d.status = :status)")
    Page<Donation> filterDonations(@Param("category") FoodCategory category,
                                   @Param("vegNonVeg") VegNonVeg vegNonVeg,
                                   @Param("status") DonationStatus status,
                                   Pageable pageable);
}
