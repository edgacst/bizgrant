package com.granthunter.service.alert;

import com.granthunter.config.AlertProperties;
import com.granthunter.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 알림 채널별 실제 발송 (이메일·SMS·카카오·Slack·Webhook·Telegram).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertDeliveryService {

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final AlertProperties alertProperties;
    private final SolapiClient solapiClient;

    public boolean deliver(String channel, String recipientId, User user, String subject, String body) {
        String normalized = channel != null ? channel.toLowerCase(Locale.ROOT) : "email";
        return switch (normalized) {
            case "email" -> sendEmail(resolveEmail(recipientId, user), subject, body);
            case "kakao" -> solapiClient.sendAlimtalk(recipientId, body);
            case "sms" -> solapiClient.sendSms(resolveSmsPhone(recipientId, user), body);
            case "slack" -> sendSlack(recipientId, body);
            case "webhook" -> sendWebhook(recipientId, subject, body);
            case "telegram" -> sendTelegram(recipientId, body);
            default -> {
                log.warn("지원하지 않는 알림 채널: {}", channel);
                yield false;
            }
        };
    }

    private boolean sendEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            log.warn("이메일 수신 주소가 비어 있습니다.");
            return false;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("[" + alertProperties.getSiteName() + "] " + subject);
            mail.setText(text);
            mailSender.send(mail);
            log.debug("이메일 발송 성공: {}", to);
            return true;
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", to, e);
            return false;
        }
    }

    private boolean sendSlack(String webhookUrl, String text) {
        if (!isHttpUrl(webhookUrl)) {
            log.warn("Slack Webhook URL이 올바르지 않습니다.");
            return false;
        }
        Map<String, Object> payload = Map.of("text", truncate(text, 39000));
        return postJson(webhookUrl, payload, "Slack");
    }

    private boolean sendWebhook(String webhookUrl, String subject, String body) {
        if (!isHttpUrl(webhookUrl)) {
            log.warn("Webhook URL이 올바르지 않습니다.");
            return false;
        }
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("source", "bizgrant");
        payload.put("site", alertProperties.getSiteName());
        payload.put("title", subject);
        payload.put("text", body);
        return postJson(webhookUrl, payload, "Webhook");
    }

    private boolean sendTelegram(String chatId, String text) {
        if (!alertProperties.getTelegram().isConfigured()) {
            log.warn("Telegram 미설정 — TELEGRAM_BOT_TOKEN 환경 변수를 설정하세요.");
            return false;
        }
        if (chatId == null || chatId.isBlank()) {
            log.warn("Telegram Chat ID가 비어 있습니다.");
            return false;
        }

        String token = alertProperties.getTelegram().getBotToken().trim();
        String url = "https://api.telegram.org/bot" + token + "/sendMessage";

        Map<String, Object> payload = Map.of(
                "chat_id", chatId.trim(),
                "text", truncate(text, 4090)
        );

        return postJson(url, payload, "Telegram");
    }

    private boolean postJson(String url, Map<String, Object> payload, String label) {
        try {
            restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.debug("{} 발송 성공", label);
            return true;
        } catch (RestClientResponseException e) {
            log.error("{} HTTP {}: {}", label, e.getStatusCode(), e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("{} 발송 실패", label, e);
            return false;
        }
    }

    private static String resolveEmail(String recipientId, User user) {
        if (recipientId != null && !recipientId.isBlank() && recipientId.contains("@")) {
            return recipientId.trim();
        }
        return user != null && user.getEmail() != null ? user.getEmail().trim() : "";
    }

    private static String resolveSmsPhone(String recipientId, User user) {
        if (recipientId != null && !recipientId.isBlank()) {
            return recipientId.trim();
        }
        return user != null && user.getPhone() != null ? user.getPhone().trim() : "";
    }

    private static boolean isHttpUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        String trimmed = url.trim().toLowerCase(Locale.ROOT);
        return trimmed.startsWith("https://") || trimmed.startsWith("http://");
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
