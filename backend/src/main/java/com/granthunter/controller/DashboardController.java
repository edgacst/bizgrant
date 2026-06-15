package com.granthunter.controller;

import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.entity.AlertPref;
import com.granthunter.repository.AlertHistoryRepository;
import com.granthunter.repository.AlertPrefRepository;
import com.granthunter.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "대시보드")
public class DashboardController {

    private final MatchingService matchingService;
    private final AlertPrefRepository alertPrefRepository;
    private final AlertHistoryRepository alertHistoryRepository;

    @GetMapping("/stats")
    @Operation(summary = "대시보드 요약 통계")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(Map.of(
                    "alertCount", 0,
                    "matchRate", 0,
                    "interestCategory", "로그인 후 설정"
            ));
        }

        Long userId = Long.parseLong(auth.getName());
        List<MatchingScoreResponse> matches = matchingService.findMatchesForUser(userId);
        int matchRate = matches.isEmpty()
                ? 0
                : (int) Math.round(matches.stream().mapToInt(MatchingScoreResponse::getMatchScore).average().orElse(0));

        AlertPref pref = alertPrefRepository.findByUserId(userId).orElse(null);
        String interestCategory = "미설정";
        if (pref != null && pref.getCategories() != null && !pref.getCategories().isBlank()) {
            interestCategory = pref.getCategories().split(",")[0].trim();
        }

        ZonedDateTime startOfDay = LocalDate.now().atStartOfDay(java.time.ZoneId.systemDefault());
        long alertCount = alertHistoryRepository.countByUserIdAndSentAtAfter(userId, startOfDay);

        return ResponseEntity.ok(Map.of(
                "alertCount", alertCount,
                "matchRate", matchRate,
                "interestCategory", interestCategory
        ));
    }
}
