package com.foodconnect.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private long totalDonors;
    private long totalRecipients;
    private long totalVolunteers;
    private long totalOrganizations;
    private long totalDonations;
    private long activeDonations;
    private long completedDonations;
    private long totalDeliveries;
    private long activeDeliveries;
    private int estimatedMealsServed;
}
