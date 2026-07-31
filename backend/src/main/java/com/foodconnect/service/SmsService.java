package com.foodconnect.service;

public interface SmsService {
    /**
     * Send an SMS message to a phone number.
     *
     * @param toPhone Destination phone number in E.164 format (e.g., +919876543210)
     * @param message Text message content to send
     * @return true if SMS request succeeded or processed, false if delivery failed
     */
    boolean sendSms(String toPhone, String message);
}
