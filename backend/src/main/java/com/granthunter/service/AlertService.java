package com.granthunter.service;

import com.granthunter.dto.AlertHistoryResponse;
import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.entity.AlertHistory;
import com.granthunter.entity.AlertPref;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.User;
import com.granthunter.repository.AlertHistoryRepository;
import com.granthunter.repository.AlertPrefRepository;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 알림 발송 서비스
 * 매칭된 공고를 사용자에게 이메일/Telegram/Slack 등으로 발송합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final MatchingService matchingService;
    private final AlertPrefRepository alertPrefRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final GrantNoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PlanService planService;

    /**
     * 매일 오전 9시 전체 사용자 알림 스윕
     * 마감 임박 공고와 신규 매칭 공고를 발송합니다.
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void dailyAlertSweep() {
        log.info("=== 일일 알림 발송 시작 (오전 9시) ===");

        List<AlertPref> enabledPrefs = alertPrefRepository.findByEnabledTrue();
        log.info("알림 활성화 사용자: {}명", enabledPrefs.size());

        for (AlertPref pref : enabledPrefs) {
            try {
                sendMatchingAlerts(pref.getUserId());
            } catch (Exception e) {
                log.error("사용자 {} 알림 발송 실패", pref.getUserId(), e);
            }
        }

        log.info("=== 일일 알림 발송 완료 ===");
    }

    /**
     * 특정 사용자에게 매칭 공고 알림 발송
     */
    @Transactional
    public void sendMatchingAlerts(Long userId) {
        AlertPref pref = alertPrefRepository.findByUserId(userId).orElse(null);
        if (pref == null || !Boolean.TRUE.equals(pref.getEnabled())) {
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        // 매칭 공고 조회
        List<MatchingScoreResponse> matches = matchingService.findMatchesForUser(userId);

        // 이미 발송한 공고 ID 목록
        List<Long> sentNoticeIds = alertHistoryRepository.findNoticeIdsByUserId(userId);

        // 미발송 + 점수 30점 이상 공고만 필터링
        List<MatchingScoreResponse> newMatches = matches.stream()
                .filter(m -> !sentNoticeIds.contains(m.getNoticeId()))
                .filter(m -> m.getMatchScore() >= 30)
                .toList();

        newMatches = planService.capAlertsForToday(user, newMatches);

        if (newMatches.isEmpty()) {
            log.debug("사용자 {} 에게 발송할 새 매칭 공고 없음", userId);
            return;
        }

        // 알림 메시지 생성
        String message = buildAlertMessage(user.getName(), newMatches);

        // 채널별 발송
        String channel = pref.getChannel() != null ? pref.getChannel() : "email";
        switch (channel.toLowerCase()) {
            case "email":
                sendEmail(user.getEmail(), "맞춤 지원사업 공고 알림", message);
                break;
            case "telegram":
                sendTelegram(pref.getChannelId(), message);
                break;
            case "slack":
                sendSlack(pref.getChannelId(), message);
                break;
            default:
                log.warn("지원하지 않는 알림 채널: {}", channel);
        }

        // 발송 이력 저장
        for (MatchingScoreResponse match : newMatches) {
            GrantNotice notice = noticeRepository.findById(match.getNoticeId()).orElse(null);
            AlertHistory history = AlertHistory.builder()
                    .userId(userId)
                    .noticeId(match.getNoticeId())
                    .channel(channel)
                    .noticeTitle(firstNonBlank(match.getTitle(), notice != null ? notice.getTitle() : null))
                    .organization(firstNonBlank(match.getOrganization(), notice != null ? notice.getOrganization() : null))
                    .build();
            alertHistoryRepository.save(history);
        }

        log.info("사용자 {} 에게 {} 건의 매칭 공고 알림 발송 (채널: {})",
                userId, newMatches.size(), channel);
    }

    /**
     * 마감 임박 공고 리마인더 발송
     * 7일, 3일, 1일 전 알림
     */
    @Transactional
    public void sendDeadlineReminder(Long userId) {
        AlertPref pref = alertPrefRepository.findByUserId(userId).orElse(null);
        if (pref == null || !Boolean.TRUE.equals(pref.getEnabled())) {
            return;
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        LocalDate today = LocalDate.now();

        // 1일, 3일, 7일 이내 마감 공고 조회
        List<GrantNotice> urgentNotices = new java.util.ArrayList<>();
        urgentNotices.addAll(noticeRepository.findEndingBetween(today, today.plusDays(1)));
        urgentNotices.addAll(noticeRepository.findEndingBetween(today.plusDays(2), today.plusDays(3)));
        urgentNotices.addAll(noticeRepository.findEndingBetween(today.plusDays(4), today.plusDays(7)));

        // 중복 제거
        urgentNotices = urgentNotices.stream()
                .distinct()
                .collect(Collectors.toList());

        if (urgentNotices.isEmpty()) {
            return;
        }

        String message = buildDeadlineMessage(user.getName(), urgentNotices);

        String channel = pref.getChannel() != null ? pref.getChannel() : "email";
        switch (channel.toLowerCase()) {
            case "email":
                sendEmail(user.getEmail(), "[긴급] 지원사업 마감 임박 알림", message);
                break;
            case "telegram":
                sendTelegram(pref.getChannelId(), message);
                break;
            case "slack":
                sendSlack(pref.getChannelId(), message);
                break;
        }

        log.info("사용자 {} 에게 {} 건의 마감 임박 알림 발송", userId, urgentNotices.size());
    }

    /**
     * 이메일 발송
     */
    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject("[GrantHunter] " + subject);
            mail.setText(text);
            mailSender.send(mail);
            log.debug("이메일 발송 성공: {} -> {}", subject, to);
        } catch (Exception e) {
            log.error("이메일 발송 실패: {}", to, e);
        }
    }

    /**
     * Telegram 알림 발송 (MVP: 로그만 남김, 실제 구현은 Bot Token 필요)
     */
    private void sendTelegram(String chatId, String message) {
        if (chatId == null || chatId.isEmpty()) {
            log.warn("Telegram chat ID가 설정되지 않았습니다.");
            return;
        }
        // TODO: Telegram Bot API 연동
        // https://api.telegram.org/bot<token>/sendMessage?chat_id=<chatId>&text=<message>
        log.info("[Telegram] chatId={} 로 알림 전송 예정: {}", chatId, message.substring(0, Math.min(100, message.length())));
    }

    /**
     * Slack 알림 발송 (MVP: 로그만 남김, 실제 구현은 Webhook URL 필요)
     */
    private void sendSlack(String webhookUrl, String message) {
        if (webhookUrl == null || webhookUrl.isEmpty()) {
            log.warn("Slack webhook URL이 설정되지 않았습니다.");
            return;
        }
        // TODO: Slack Incoming Webhook 연동
        log.info("[Slack] webhook={} 로 알림 전송 예정: {}", webhookUrl, message.substring(0, Math.min(100, message.length())));
    }

    /**
     * 매칭 공고 알림 메시지 생성
     */
    private String buildAlertMessage(String userName, List<MatchingScoreResponse> matches) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%s님을 위한 맞춤 지원사업 공고입니다.\n\n", userName));
        sb.append("━━━━━━━━━━━━━━━━━━━━\n");

        for (int i = 0; i < matches.size(); i++) {
            MatchingScoreResponse match = matches.get(i);
            sb.append(String.format("[%d] %s (매칭도: %d%%)\n", i + 1, match.getTitle(), match.getMatchScore()));
            sb.append(String.format("    주관기관: %s\n", match.getOrganization()));
            sb.append(String.format("    카테고리: %s\n", match.getCategory()));
            if (match.getApplyEnd() != null) {
                sb.append(String.format("    마감일: %s\n", match.getApplyEnd()));
            }
            if (match.getBudget() != null) {
                sb.append(String.format("    지원규모: %s\n", match.getBudget()));
            }
            sb.append(String.format("    상세보기: %s\n", match.getUrl()));
            sb.append("\n");
        }

        sb.append("━━━━━━━━━━━━━━━━━━━━\n");
        sb.append("GrantHunter에서 더 많은 지원사업을 확인하세요!\n");

        return sb.toString();
    }

    /**
     * 마감 임박 알림 메시지 생성
     */
    private String buildDeadlineMessage(String userName, List<GrantNotice> notices) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("[긴급] %s님, 마감 임박 지원사업이 있습니다!\n\n", userName));

        for (GrantNotice notice : notices) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), notice.getApplyEnd());
            String urgency = daysLeft <= 1 ? "⚠️ 오늘 마감!" : 
                            daysLeft <= 3 ? "🔴 " + daysLeft + "일 남음" : 
                            "🟡 " + daysLeft + "일 남음";

            sb.append(String.format("• %s\n", notice.getTitle()));
            sb.append(String.format("  %s | 마감: %s (%s)\n", 
                    notice.getOrganization(), notice.getApplyEnd(), urgency));
            sb.append(String.format("  %s\n\n", notice.getUrl()));
        }

        sb.append("지금 바로 확인하세요!\n");

        return sb.toString();
    }

    /**
     * 알림 이력 조회 (공고 제목·기관 포함, 기존 이력 제목 보강)
     */
    @Transactional
    public List<AlertHistoryResponse> getUserAlertHistory(Long userId) {
        List<AlertHistory> history = alertHistoryRepository.findByUserIdOrderBySentAtDesc(userId);
        if (history.isEmpty()) {
            return List.of();
        }

        Set<Long> noticeIds = history.stream()
                .map(AlertHistory::getNoticeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, GrantNotice> grantsById = noticeRepository.findAllById(noticeIds).stream()
                .collect(Collectors.toMap(GrantNotice::getId, Function.identity()));

        List<AlertHistory> stale = new java.util.ArrayList<>();
        for (AlertHistory item : history) {
            if (item.getNoticeTitle() != null && !item.getNoticeTitle().isBlank()) {
                continue;
            }
            GrantNotice grant = grantsById.get(item.getNoticeId());
            if (grant == null) {
                continue;
            }
            item.setNoticeTitle(grant.getTitle());
            item.setOrganization(grant.getOrganization());
            stale.add(item);
        }
        if (!stale.isEmpty()) {
            alertHistoryRepository.saveAll(stale);
        }

        return history.stream()
                .map(item -> AlertHistoryResponse.from(item, grantsById.get(item.getNoticeId())))
                .toList();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    public long countUnread(Long userId) {
        return alertHistoryRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public int markAsRead(Long userId, List<Long> ids) {
        List<AlertHistory> items;
        if (ids == null || ids.isEmpty()) {
            items = alertHistoryRepository.findByUserIdAndReadAtIsNull(userId);
        } else {
            items = alertHistoryRepository.findByUserIdAndIdInAndReadAtIsNull(userId, ids);
        }

        if (items.isEmpty()) {
            return 0;
        }

        ZonedDateTime now = ZonedDateTime.now();
        for (AlertHistory item : items) {
            item.setReadAt(now);
        }
        alertHistoryRepository.saveAll(items);
        return items.size();
    }
}
