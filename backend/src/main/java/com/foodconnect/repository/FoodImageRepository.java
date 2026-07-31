package com.foodconnect.repository;

import com.foodconnect.entity.FoodImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodImageRepository extends JpaRepository<FoodImage, Long> {
    List<FoodImage> findByDonationId(UUID donationId);
    void deleteByDonationId(UUID donationId);
}
