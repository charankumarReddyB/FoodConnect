package com.foodconnect.service.impl;

import com.foodconnect.service.SmsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

    @Value("${app.sms.enabled:true}")
    private boolean smsEnabled;

    @Value("${app.sms.provider:TWILIO}")
    private String smsProvider;

    @Value("${app.sms.account-sid:AC_MOCK_TWILIO_ACCOUNT_SID}")
    private String accountSid;

    @Value("${app.sms.auth-token:MOCK_TWILIO_AUTH_TOKEN}")
    private String authToken;

    @Value("${app.sms.from-number:+15005550006}")
    private String fromNumber;

    private final RestTemplate restTemplate;

    public SmsServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public boolean sendSms(String toPhone, String message) {
        String formattedPhone = normalizePhone(toPhone);
        log.info("Initiating SMS dispatch via provider: {} to phone: {}", smsProvider, formattedPhone);

        if (!smsEnabled) {
            log.info("[SMS DISABLED] Message for {}: {}", formattedPhone, message);
            return true;
        }

        try {
            if ("TWILIO".equalsIgnoreCase(smsProvider)) {
                return sendTwilioSms(formattedPhone, message);
            } else {
                log.info("[SMS GATEWAY LOG] Sent message to {}: {}", formattedPhone, message);
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", formattedPhone, e.getMessage(), e);
            return false;
        }
    }

    private String normalizePhone(String rawPhone) {
        if (rawPhone == null) return "";
        String cleaned = rawPhone.trim().replaceAll("[^+\\d]", "");
        if (!cleaned.startsWith("+")) {
            if (cleaned.length() == 10) {
                cleaned = "+91" + cleaned;
            } else {
                cleaned = "+" + cleaned;
            }
        }
        return cleaned;
    }

    private boolean sendTwilioSms(String toPhone, String message) {
        try {
            String twilioUrl = String.format("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            String auth = accountSid + ":" + authToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
            headers.set("Authorization", "Basic " + encodedAuth);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("To", toPhone);
            map.add("From", fromNumber);
            map.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            if (accountSid == null || accountSid.startsWith("AC_MOCK") || authToken.contains("MOCK")) {
                log.info("[SMS MOCK MODE] Dev OTP mode active for {}. Code message: {}", toPhone, message);
                return true;
            }

            ResponseEntity<String> response = restTemplate.postForEntity(twilioUrl, request, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Twilio SMS delivered successfully to {}. Response: {}", toPhone, response.getBody());
                return true;
            } else {
                log.warn("Twilio SMS request returned status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("Error executing Twilio SMS API call to {}: {}", toPhone, e.getMessage());
            log.info("[SMS FALLBACK LOG] Message intended for {}: {}", toPhone, message);
            return false;
        }
    }
}
