package com.foodconnect.repository;

import com.foodconnect.entity.FoodImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodImageRepository extends JpaRepository<FoodImage, Long> {
    List<FoodImage> findByDonationId(Long donationId);
    void deleteByDonationId(Long donationId);
}
