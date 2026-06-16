package com.granthunter.service.alert;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.granthunter.config.AlertProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Solapi(SOLAPI) SMS·카카오 알림톡 발송.
 * @see <a href="https://docs.solapi.com/">Solapi API 문서</a>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SolapiClient {

    private static final String SEND_URL = "https://api.solapi.com/messages/v4/send";

    private final AlertProperties alertProperties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public boolean sendSms(String toPhone, String text) {
        AlertProperties.Solapi solapi = alertProperties.getSolapi();
        if (!solapi.isConfigured()) {
            log.warn("Solapi 미설정 — SMS 발송 불가 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER)");
            return false;
        }

        String normalizedTo = normalizePhone(toPhone);
        if (normalizedTo.isBlank()) {
            log.warn("SMS 수신 번호가 비어 있습니다.");
            return false;
        }

        String body = truncate(text, 2000);
        String type = body.length() > 90 ? "LMS" : "SMS";

        Map<String, Object> message = new LinkedHashMap<>();
        message.put("to", normalizedTo);
        message.put("from", normalizePhone(solapi.getSender()));
        message.put("text", body);
        message.put("type", type);

        return postMessage(Map.of("message", message));
    }

    public boolean sendAlimtalk(String toPhone, String fallbackText) {
        AlertProperties.Solapi solapi = alertProperties.getSolapi();
        AlertProperties.Kakao kakao = alertProperties.getKakao();
        if (!solapi.isConfigured()) {
            log.warn("Solapi 미설정 — 카카오 알림톡 발송 불가");
            return false;
        }
        if (!kakao.isAlimtalkConfigured()) {
            log.info("카카오 알림톡 템플릿 미설정 — SMS로 대체 발송 시도");
            return sendSms(toPhone, fallbackText);
        }

        String normalizedTo = normalizePhone(toPhone);
        if (normalizedTo.isBlank()) {
            log.warn("카카오 알림 수신 번호가 비어 있습니다.");
            return false;
        }

        Map<String, Object> kakaoOptions = new LinkedHashMap<>();
        kakaoOptions.put("pfId", kakao.getPfId());
        kakaoOptions.put("templateId", kakao.getTemplateId());
        kakaoOptions.put("variables", Map.of(
                kakao.getContentVariable(), truncate(fallbackText, 500)
        ));

        Map<String, Object> message = new LinkedHashMap<>();
        message.put("to", normalizedTo);
        message.put("from", normalizePhone(solapi.getSender()));
        message.put("text", truncate(fallbackText, 500));
        message.put("kakaoOptions", kakaoOptions);

        return postMessage(Map.of("message", message));
    }

    private boolean postMessage(Map<String, Object> payload) {
        AlertProperties.Solapi solapi = alertProperties.getSolapi();
        try {
            String response = restClient.post()
                    .uri(SEND_URL)
                    .header(HttpHeaders.AUTHORIZATION, createAuthorization(solapi.getApiKey(), solapi.getApiSecret()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                if (root.has("errorCode")) {
                    log.error("Solapi 오류: {}", response);
                    return false;
                }
            }
            log.debug("Solapi 발송 성공");
            return true;
        } catch (RestClientResponseException e) {
            log.error("Solapi HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("Solapi 발송 실패", e);
            return false;
        }
    }

    static String createAuthorization(String apiKey, String apiSecret) {
        String date = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
                .withZone(ZoneOffset.UTC)
                .format(Instant.now());
        String salt = UUID.randomUUID().toString().replace("-", "");
        String signature = hmacSha256(date + salt, apiSecret);
        return String.format("HMAC-SHA256 ApiKey=%s, Date=%s, Salt=%s, Signature=%s",
                apiKey, date, salt, signature);
    }

    private static String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Solapi 서명 생성 실패", e);
        }
    }

    static String normalizePhone(String raw) {
        if (raw == null) {
            return "";
        }
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.startsWith("82") && digits.length() >= 11) {
            return "0" + digits.substring(2);
        }
        return digits;
    }

    private static String truncate(String text, int max) {
        if (text == null) {
            return "";
        }
        if (text.length() <= max) {
            return text;
        }
        return text.substring(0, max - 3) + "...";
    }
}
