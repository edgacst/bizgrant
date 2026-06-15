package com.granthunter.service;

import com.granthunter.config.NewsletterProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.NewsletterSubscriber;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsletterService {

    private final NewsletterSubscriberRepository subscriberRepository;
    private final GrantNoticeRepository grantNoticeRepository;
    private final JavaMailSender mailSender;
    private final NewsletterProperties properties;

    @Scheduled(cron = "${app.newsletter.cron:0 0 9 * * MON}")
    public void scheduledWeeklySend() {
        if (!properties.isEnabled()) {
            log.info("뉴스레터 자동 발송 비활성화 상태");
            return;
        }
        log.info("=== 주간 뉴스레터 자동 발송 시작 ===");
        Map<String, Object> result = sendWeeklyDigest();
        log.info("=== 주간 뉴스레터 자동 발송 완료: {} ===", result);
    }

    @Transactional
    public void backfillSubscriberTokens() {
        subscriberRepository.findAll().forEach(subscriber -> {
            boolean changed = false;
            if (subscriber.getUnsubscribeToken() == null || subscriber.getUnsubscribeToken().isBlank()) {
                subscriber.setUnsubscribeToken(UUID.randomUUID().toString());
                changed = true;
            }
            if (changed) {
                subscriberRepository.save(subscriber);
            }
        });
    }

    @Transactional
    public Map<String, Object> sendWeeklyDigest() {
        backfillSubscriberTokens();
        List<NewsletterSubscriber> subscribers = subscriberRepository.findByActiveTrue();
        LocalDate today = LocalDate.now();
        ZonedDateTime since = ZonedDateTime.now().minusDays(properties.getLookbackDays());

        List<GrantNotice> recentGrants = grantNoticeRepository
                .findRecentActiveNotices(since, today, PageRequest.of(0, properties.getTopCount()))
                .getContent();

        List<GrantNotice> urgentGrants = grantNoticeRepository
                .findEndingBetween(today, today.plusDays(7))
                .stream()
                .limit(properties.getUrgentCount())
                .toList();

        long activeTotal = grantNoticeRepository.countActiveNotices(today);
        String subject = buildSubject(today);
        int sent = 0;
        int failed = 0;

        for (NewsletterSubscriber subscriber : subscribers) {
            ensureToken(subscriber);
            try {
                String body = buildEmailBody(subscriber, recentGrants, urgentGrants, activeTotal, today);
                sendEmail(subscriber.getEmail(), subject, body);
                subscriber.setLastSentAt(ZonedDateTime.now());
                sent++;
            } catch (Exception e) {
                failed++;
                log.warn("뉴스레터 발송 실패 ({}): {}", subscriber.getEmail(), e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "success");
        result.put("subscriberCount", subscribers.size());
        result.put("sent", sent);
        result.put("failed", failed);
        result.put("recentGrantCount", recentGrants.size());
        result.put("urgentGrantCount", urgentGrants.size());
        result.put("activeTotal", activeTotal);
        return result;
    }

    @Transactional
    public boolean unsubscribe(String token) {
        return subscriberRepository.findByUnsubscribeToken(token)
                .map(subscriber -> {
                    subscriber.setActive(false);
                    return true;
                })
                .orElse(false);
    }

    public Map<String, Object> getStats() {
        long active = subscriberRepository.findByActiveTrue().size();
        long total = subscriberRepository.count();
        return Map.of(
                "activeSubscribers", active,
                "totalSubscribers", total,
                "enabled", properties.isEnabled(),
                "cron", properties.getCron()
        );
    }

    private void ensureToken(NewsletterSubscriber subscriber) {
        if (subscriber.getUnsubscribeToken() == null || subscriber.getUnsubscribeToken().isBlank()) {
            subscriber.setUnsubscribeToken(UUID.randomUUID().toString());
        }
    }

    private String buildSubject(LocalDate today) {
        String date = today.format(DateTimeFormatter.ofPattern("M월 d일"));
        return String.format("[BizGrant] 주간 지원사업 뉴스레터 (%s)", date);
    }

    private String buildEmailBody(
            NewsletterSubscriber subscriber,
            List<GrantNotice> recentGrants,
            List<GrantNotice> urgentGrants,
            long activeTotal,
            LocalDate today) {

        StringBuilder sb = new StringBuilder();
        sb.append("안녕하세요, BizGrant 뉴스레터입니다.\n\n");
        sb.append(String.format("현재 신청 가능한 지원사업: %,d건\n", activeTotal));
        sb.append(String.format("최근 %d일간 등록·갱신된 주요 공고 %d건을 전해드립니다.\n\n",
                properties.getLookbackDays(), recentGrants.size()));

        if (!recentGrants.isEmpty()) {
            sb.append("━━━ 이번 주 주요 지원사업 ━━━\n");
            int index = 1;
            for (GrantNotice grant : recentGrants) {
                sb.append(String.format("%d. [%s] %s\n", index++, grant.getCategory(), grant.getTitle()));
                sb.append(String.format("   기관: %s | 마감: %s\n",
                        grant.getOrganization(), formatDeadline(grant.getApplyEnd())));
                if (grant.getUrl() != null && !grant.getUrl().isBlank()) {
                    sb.append(String.format("   링크: %s\n", grant.getUrl()));
                }
                sb.append('\n');
            }
        } else {
            sb.append("이번 주 신규 등록 공고가 없습니다. 아래 마감 임박 공고를 확인해주세요.\n\n");
        }

        if (!urgentGrants.isEmpty()) {
            sb.append("━━━ 마감 임박 공고 (7일 이내) ━━━\n");
            for (GrantNotice grant : urgentGrants) {
                long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, grant.getApplyEnd());
                sb.append(String.format("• D-%d | [%s] %s\n", Math.max(daysLeft, 0), grant.getCategory(), grant.getTitle()));
                sb.append(String.format("  %s | 마감 %s\n", grant.getOrganization(), grant.getApplyEnd()));
            }
            sb.append('\n');
        }

        sb.append(String.format("전체 공고 보기: %s/grants\n", trimSlash(properties.getSiteUrl())));
        sb.append(String.format("무료 회원가입: %s/signup\n\n", trimSlash(properties.getSiteUrl())));
        sb.append("---\n");
        sb.append(String.format("구독 해지: %s/newsletter/unsubscribe?token=%s\n",
                trimSlash(properties.getSiteUrl()), subscriber.getUnsubscribeToken()));
        sb.append("본 메일은 BizGrant 뉴스레터 구독자에게 발송됩니다.\n");
        return sb.toString();
    }

    private String formatDeadline(LocalDate applyEnd) {
        if (applyEnd == null) return "미정";
        if (applyEnd.getYear() >= 2099) return "상시";
        return applyEnd.toString();
    }

    private String trimSlash(String url) {
        if (url == null) return "";
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(properties.getFrom());
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        mailSender.send(mail);
    }
}
