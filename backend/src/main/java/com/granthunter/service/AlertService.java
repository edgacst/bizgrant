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
import com.granthunter.config.AlertProperties;
import com.granthunter.service.alert.AlertDeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 * 매칭된 공고를 사용자에게 이메일·카카오톡·문자로 발송합니다.
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
    private final PlanService planService;
    private final AlertDeliveryService alertDeliveryService;
    private final AlertProperties alertProperties;

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
        String subject = "맞춤 지원사업 공고 알림";

        // 채널별 발송
        String channel = pref.getChannel() != null ? pref.getChannel() : "email";
        boolean sent = alertDeliveryService.deliver(channel, pref.getChannelId(), user, subject, message);
        if (!sent) {
            log.warn("사용자 {} 알림 발송 실패 (채널: {}) — 이력 저장 안 함", userId, channel);
            return;
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
        String subject = "[긴급] 지원사업 마감 임박 알림";

        String channel = pref.getChannel() != null ? pref.getChannel() : "email";
        boolean sent = alertDeliveryService.deliver(channel, pref.getChannelId(), user, subject, message);
        if (!sent) {
            log.warn("사용자 {} 마감 알림 발송 실패 (채널: {})", userId, channel);
            return;
        }

        log.info("사용자 {} 에게 {} 건의 마감 임박 알림 발송", userId, urgentNotices.size());
    }

    /**
     * 저장된 채널로 테스트 메시지 1건 발송 (이력 저장 없음)
     */
    public Map<String, Object> sendTestNotification(Long userId) {
        AlertPref pref = alertPrefRepository.findByUserId(userId).orElse(null);
        if (pref == null) {
            return Map.of("success", false, "message", "알림 설정을 먼저 저장해 주세요.");
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "사용자 정보를 찾을 수 없습니다.");
        }

        String channel = pref.getChannel() != null ? pref.getChannel() : "email";
        String subject = "알림 채널 테스트";
        String body = """
                BizGrant 알림 테스트입니다.

                이 메시지가 보이면 선택하신 채널 설정이 정상입니다.
                매일 오전 9시경 맞춤 지원사업 공고가 이 채널로 발송됩니다.
                """;

        boolean sent = alertDeliveryService.deliver(channel, pref.getChannelId(), user, subject, body);
        if (sent) {
            return Map.of("success", true, "message", "테스트 알림을 발송했습니다. 수신함을 확인해 주세요.");
        }
        return Map.of(
                "success", false,
                "message", "발송에 실패했습니다. 채널별 수신 정보와 서버 연동 설정(SMTP·Solapi·Telegram 등)을 확인해 주세요."
        );
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
        sb.append(alertProperties.getSiteName()).append("에서 더 많은 지원사업을 확인하세요!\n");

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

    @Transactional
    public int deleteHistory(Long userId, Long id) {
        List<AlertHistory> items = alertHistoryRepository.findByUserIdAndIdIn(userId, List.of(id));
        if (items.isEmpty()) {
            return 0;
        }
        alertHistoryRepository.deleteAll(items);
        return items.size();
    }

    @Transactional
    public int deleteHistory(Long userId, List<Long> ids, boolean deleteAll) {
        if (deleteAll) {
            long count = alertHistoryRepository.countByUserId(userId);
            alertHistoryRepository.deleteByUserId(userId);
            return (int) count;
        }
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        List<AlertHistory> items = alertHistoryRepository.findByUserIdAndIdIn(userId, ids);
        if (items.isEmpty()) {
            return 0;
        }
        alertHistoryRepository.deleteAll(items);
        return items.size();
    }
}
