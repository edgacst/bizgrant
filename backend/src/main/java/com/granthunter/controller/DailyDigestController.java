package com.granthunter.controller;

import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.security.AuthenticationUtils;
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
import java.util.List;
import java.util.Map;

/**
 * 오늘의 다이제스트 API 컨트롤러
 * 사용자에게 오늘 마감 또는 매칭도 높은 공고 요약을 제공합니다.
 */
@RestController
@RequestMapping("/api/digest")
@RequiredArgsConstructor
@Tag(name = "오늘의 다이제스트", description = "일일 추천 공고 요약 API")
public class DailyDigestController {

    private final MatchingService matchingService;

    @GetMapping("/today")
    @Operation(summary = "오늘의 다이제스트", description = "오늘의 추천 공고와 마감 임박 공고를 요약하여 제공합니다.")
    public ResponseEntity<Map<String, Object>> getTodayDigest(Authentication auth) {
        Long userId = AuthenticationUtils.requireUserId(auth);

        List<MatchingScoreResponse> matches = matchingService.findMatchesForUser(userId);

        // 상위 10개 매칭 공고
        List<MatchingScoreResponse> topMatches = matches.stream()
                .limit(10)
                .toList();

        // 마감 임박 공고 (7일 이내)
        LocalDate today = LocalDate.now();
        List<MatchingScoreResponse> urgentMatches = matches.stream()
                .filter(m -> m.getApplyEnd() != null
                        && !m.getApplyEnd().isBefore(today)
                        && m.getApplyEnd().isBefore(today.plusDays(7)))
                .sorted((a, b) -> a.getApplyEnd().compareTo(b.getApplyEnd()))
                .toList();

        int totalActiveMatches = (int) matches.stream()
                .filter(m -> m.getMatchScore() >= 30)
                .count();

        return ResponseEntity.ok(Map.of(
                "date", today.toString(),
                "totalActiveMatches", totalActiveMatches,
                "urgentCount", urgentMatches.size(),
                "topRecommendations", topMatches,
                "urgentDeadlines", urgentMatches
        ));
    }
}
