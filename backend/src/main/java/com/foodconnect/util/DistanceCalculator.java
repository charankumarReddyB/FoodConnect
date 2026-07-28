package com.foodconnect.util;

import com.foodconnect.constants.AppConstants;

public class DistanceCalculator {

    /**
     * Calculates distance between two points in Latitude and Longitude using Haversine formula.
     * @return Distance in Kilometers rounded to 2 decimal places.
     */
    public static double calculateDistanceInKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return 0.0;
        }

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        double distance = AppConstants.EARTH_RADIUS_KM * c;
        return Math.round(distance * 100.0) / 100.0;
    }
}
