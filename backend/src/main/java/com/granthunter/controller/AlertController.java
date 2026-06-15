package com.granthunter.controller;

import com.granthunter.dto.AlertHistoryResponse;
import com.granthunter.dto.AlertPrefRequest;
import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.entity.AlertPref;
import com.granthunter.entity.User;
import com.granthunter.repository.AlertPrefRepository;
import com.granthunter.repository.UserRepository;
import com.granthunter.security.AuthenticationUtils;
import com.granthunter.service.AlertService;
import com.granthunter.service.MatchingService;
import com.granthunter.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 알림 설정 및 매칭 API 컨트롤러
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "알림 설정", description = "알림 기본 설정, 공고 매칭, 알림 이력 API")
public class AlertController {

    private final AlertPrefRepository alertPrefRepository;
    private final MatchingService matchingService;
    private final AlertService alertService;
    private final UserRepository userRepository;
    private final PlanService planService;

    /**
     * 현재 인증된 사용자 ID 추출
     */
    private Long getCurrentUserId(Authentication auth) {
        return AuthenticationUtils.requireUserId(auth);
    }

    @PostMapping("/prefs")
    @Operation(summary = "알림 설정 등록", description = "사용자의 알림 기본 설정을 등록합니다.")
    public ResponseEntity<AlertPref> createPref(
            Authentication auth,
            @RequestBody AlertPrefRequest request) {

        Long userId = getCurrentUserId(auth);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        planService.validateAlertPref(user, request);

        // 기존 설정이 있으면 덮어쓰기
        alertPrefRepository.findByUserId(userId).ifPresent(alertPrefRepository::delete);

        AlertPref pref = AlertPref.builder()
                .userId(userId)
                .categories(request.getCategories())
                .industries(request.getIndustries())
                .minBudget(request.getMinBudget())
                .channel(request.getChannel())
                .channelId(request.getChannelId())
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .build();

        return ResponseEntity.ok(alertPrefRepository.save(pref));
    }

    @GetMapping("/prefs")
    @Operation(summary = "알림 설정 조회", description = "현재 사용자의 알림 설정을 조회합니다.")
    public ResponseEntity<AlertPref> getPrefs(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        return alertPrefRepository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/prefs")
    @Operation(summary = "알림 설정 수정", description = "현재 사용자의 알림 설정을 수정합니다.")
    public ResponseEntity<AlertPref> updatePrefs(
            Authentication auth,
            @RequestBody AlertPrefRequest request) {

        Long userId = getCurrentUserId(auth);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        planService.validateAlertPref(user, request);

        AlertPref pref = alertPrefRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("알림 설정을 찾을 수 없습니다."));

        if (request.getCategories() != null) pref.setCategories(request.getCategories());
        if (request.getIndustries() != null) pref.setIndustries(request.getIndustries());
        if (request.getMinBudget() != null) pref.setMinBudget(request.getMinBudget());
        if (request.getChannel() != null) pref.setChannel(request.getChannel());
        if (request.getChannelId() != null) pref.setChannelId(request.getChannelId());
        if (request.getEnabled() != null) pref.setEnabled(request.getEnabled());

        return ResponseEntity.ok(alertPrefRepository.save(pref));
    }

    @GetMapping("/matches")
    @Operation(summary = "매칭 공고 조회", description = "현재 사용자에게 매칭되는 지원사업 공고를 조회합니다.")
    public ResponseEntity<List<MatchingScoreResponse>> getMatches(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<MatchingScoreResponse> matches = matchingService.findMatchesForUser(userId);
        return ResponseEntity.ok(matches);
    }

    @GetMapping("/history")
    @Operation(summary = "알림 이력 조회", description = "현재 사용자의 알림 발송 이력을 조회합니다.")
    public ResponseEntity<List<AlertHistoryResponse>> getHistory(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<AlertHistoryResponse> history = alertService.getUserAlertHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/unread-count")
    @Operation(summary = "읽지 않은 알림 수")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        return ResponseEntity.ok(Map.of("count", alertService.countUnread(userId)));
    }

    @PostMapping("/history/read")
    @Operation(summary = "알림 읽음 처리", description = "ids가 비어 있으면 미읽음 알림을 모두 읽음 처리합니다.")
    public ResponseEntity<Map<String, Integer>> markHistoryRead(
            Authentication auth,
            @RequestBody(required = false) Map<String, List<Long>> body) {
        Long userId = getCurrentUserId(auth);
        List<Long> ids = body != null ? body.get("ids") : null;
        int updated = alertService.markAsRead(userId, ids);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/history/{id}")
    @Operation(summary = "알림 이력 삭제", description = "단일 알림 이력을 삭제합니다.")
    public ResponseEntity<Map<String, Integer>> deleteHistoryItem(
            Authentication auth,
            @PathVariable Long id) {
        Long userId = getCurrentUserId(auth);
        int deleted = alertService.deleteHistory(userId, id);
        if (deleted == 0) {
            throw new IllegalArgumentException("삭제할 알림을 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    @PostMapping("/history/delete")
    @Operation(summary = "알림 이력 일괄 삭제", description = "ids 목록 또는 all=true로 이력을 삭제합니다.")
    public ResponseEntity<Map<String, Integer>> deleteHistoryBatch(
            Authentication auth,
            @RequestBody(required = false) Map<String, Object> body) {
        Long userId = getCurrentUserId(auth);
        boolean deleteAll = body != null && Boolean.TRUE.equals(body.get("all"));
        List<Long> ids = null;
        if (body != null && body.get("ids") instanceof List<?> rawIds) {
            ids = rawIds.stream()
                    .map(Object::toString)
                    .map(Long::valueOf)
                    .toList();
        }
        int deleted = alertService.deleteHistory(userId, ids, deleteAll);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    @PostMapping("/alerts/send")
    @Operation(summary = "매칭 알림 수동 발송", description = "현재 사용자에게 매칭 알림을 수동으로 발송합니다.")
    public ResponseEntity<Map<String, String>> sendAlerts(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        alertService.sendMatchingAlerts(userId);
        return ResponseEntity.ok(Map.of("message", "알림이 발송되었습니다."));
    }
}
