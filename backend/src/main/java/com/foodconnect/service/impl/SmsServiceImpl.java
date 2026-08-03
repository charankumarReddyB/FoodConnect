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

    // Twilio credentials
    @Value("${app.sms.account-sid:${TWILIO_ACCOUNT_SID:AC_MOCK_TWILIO_ACCOUNT_SID}}")
    private String accountSid;

    @Value("${app.sms.auth-token:${TWILIO_AUTH_TOKEN:MOCK_TWILIO_AUTH_TOKEN}}")
    private String authToken;

    @Value("${app.sms.from-number:${TWILIO_FROM_NUMBER:+15005550006}}")
    private String fromNumber;

    // MSG91 credentials
    @Value("${app.sms.msg91.auth-key:${MSG91_AUTH_KEY:}}")
    private String msg91AuthKey;

    @Value("${app.sms.msg91.template-id:${MSG91_TEMPLATE_ID:}}")
    private String msg91TemplateId;

    // Vonage credentials
    @Value("${app.sms.vonage.api-key:${VONAGE_API_KEY:}}")
    private String vonageApiKey;

    @Value("${app.sms.vonage.api-secret:${VONAGE_API_SECRET:}}")
    private String vonageApiSecret;

    private final RestTemplate restTemplate;

    public SmsServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public boolean sendSms(String toPhone, String message) {
        String formattedPhone = normalizePhone(toPhone);
        log.info("[SMS DISPATCH START] Provider: {}, Target Phone: {}", smsProvider, formattedPhone);

        if (!smsEnabled) {
            log.warn("[SMS DISPATCH REJECTED] SMS service is explicitly disabled in application configuration.");
            return false;
        }

        try {
            if ("MSG91".equalsIgnoreCase(smsProvider)) {
                return sendMsg91Sms(formattedPhone, message);
            } else if ("VONAGE".equalsIgnoreCase(smsProvider)) {
                return sendVonageSms(formattedPhone, message);
            } else if ("TWILIO".equalsIgnoreCase(smsProvider)) {
                return sendTwilioSms(formattedPhone, message);
            } else {
                log.error("[SMS DISPATCH ERROR] Unknown or unsupported SMS provider: {}", smsProvider);
                return false;
            }
        } catch (Exception e) {
            log.error("[SMS DISPATCH FAILURE] Failed to send SMS to {}: {}", formattedPhone, e.getMessage(), e);
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
        if (accountSid == null || accountSid.isBlank() || accountSid.startsWith("AC_MOCK") ||
                authToken == null || authToken.isBlank() || authToken.contains("MOCK")) {
            log.error("[SMS GATEWAY ERROR] Twilio credentials are not configured or set to mock values. ACCOUNT_SID: {}, AUTH_TOKEN: [CONFIGURED={}]",
                    accountSid, authToken != null && !authToken.contains("MOCK"));
            return false;
        }

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

            log.info("[OUTGOING SMS REQUEST] Provider: Twilio, URL: {}, Recipient: {}, From: {}", twilioUrl, toPhone, fromNumber);
            ResponseEntity<String> response = restTemplate.postForEntity(twilioUrl, request, String.class);

            log.info("[SMS PROVIDER RESPONSE] Provider: Twilio, Status: {}, Body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String body = response.getBody().toLowerCase();
                boolean isAccepted = body.contains("\"sid\"") && (body.contains("\"queued\"") || body.contains("\"sent\"") || body.contains("\"delivered\"") || body.contains("\"created\""));
                if (isAccepted) {
                    log.info("[SMS DELIVERY CONFIRMED] Twilio accepted message for {}", toPhone);
                    return true;
                } else {
                    log.error("[SMS PROVIDER REJECTED] Twilio response did not confirm delivery acceptance for {}", toPhone);
                    return false;
                }
            } else {
                log.error("[SMS PROVIDER ERROR] Twilio HTTP request failed with status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("[SMS GATEWAY EXCEPTION] Failed executing Twilio REST API request to {}: {}", toPhone, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendMsg91Sms(String toPhone, String message) {
        if (msg91AuthKey == null || msg91AuthKey.isBlank()) {
            log.error("[SMS GATEWAY ERROR] MSG91 credentials are not configured. MSG91_AUTH_KEY is missing.");
            return false;
        }

        try {
            String url = "https://control.msg91.com/api/v5/flow/";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authkey", msg91AuthKey);

            String digitsOnly = toPhone.replaceAll("[^0-9]", "");
            String body = String.format("{\"template_id\":\"%s\",\"recipients\":[{\"mobiles\":\"%s\"}]}", msg91TemplateId, digitsOnly);
            HttpEntity<String> request = new HttpEntity<>(body, headers);

            log.info("[OUTGOING SMS REQUEST] Provider: MSG91, URL: {}, Recipient: {}", url, digitsOnly);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("[SMS PROVIDER RESPONSE] Provider: MSG91, Status: {}, Body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String responseBody = response.getBody().toLowerCase();
                boolean isAccepted = responseBody.contains("\"type\":\"success\"") || responseBody.contains("\"success\"");
                if (isAccepted) {
                    log.info("[SMS DELIVERY CONFIRMED] MSG91 accepted message for {}", toPhone);
                    return true;
                } else {
                    log.error("[SMS PROVIDER REJECTED] MSG91 response indicated failure for {}", toPhone);
                    return false;
                }
            } else {
                log.error("[SMS PROVIDER ERROR] MSG91 HTTP request failed with status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("[SMS GATEWAY EXCEPTION] Failed executing MSG91 REST API request to {}: {}", toPhone, e.getMessage(), e);
            return false;
        }
    }

    private boolean sendVonageSms(String toPhone, String message) {
        if (vonageApiKey == null || vonageApiKey.isBlank() || vonageApiSecret == null || vonageApiSecret.isBlank()) {
            log.error("[SMS GATEWAY ERROR] Vonage credentials are not configured. VONAGE_API_KEY or VONAGE_API_SECRET is missing.");
            return false;
        }

        try {
            String url = "https://rest.nexmo.com/sms/json";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("api_key", vonageApiKey);
            map.add("api_secret", vonageApiSecret);
            map.add("to", toPhone.replaceAll("[^0-9]", ""));
            map.add("from", "FoodConnect");
            map.add("text", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            log.info("[OUTGOING SMS REQUEST] Provider: Vonage, URL: {}, Recipient: {}", url, toPhone);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            log.info("[SMS PROVIDER RESPONSE] Provider: Vonage, Status: {}, Body: {}", response.getStatusCode(), response.getBody());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String responseBody = response.getBody();
                boolean isAccepted = responseBody.contains("\"status\": \"0\"") || responseBody.contains("\"status\":\"0\"");
                if (isAccepted) {
                    log.info("[SMS DELIVERY CONFIRMED] Vonage accepted message for {}", toPhone);
                    return true;
                } else {
                    log.error("[SMS PROVIDER REJECTED] Vonage response indicated non-zero status for {}", toPhone);
                    return false;
                }
            } else {
                log.error("[SMS PROVIDER ERROR] Vonage HTTP request failed with status: {}", response.getStatusCode());
                return false;
            }
        } catch (Exception e) {
            log.error("[SMS GATEWAY EXCEPTION] Failed executing Vonage REST API request to {}: {}", toPhone, e.getMessage(), e);
            return false;
        }
    }
}
