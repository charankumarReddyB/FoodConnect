package com.foodconnect.util;

public class LocationUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the Haversine distance between two geographical points (lat/long) in kilometers.
     */
    public static double calculateDistanceKm(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Checks if two coordinates are within the specified radius in kilometers.
     */
    public static boolean isWithinRadius(Double lat1, Double lon1, Double lat2, Double lon2, double radiusKm) {
        return calculateDistanceKm(lat1, lon1, lat2, lon2) <= radiusKm;
    }
}
