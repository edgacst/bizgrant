package com.granthunter.controller;

import com.granthunter.collector.GrantSource;
import com.granthunter.dto.GrantNoticeResponse;
import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.User;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.service.AuthenticatedUserResolver;
import com.granthunter.service.GrantNoticeService;
import com.granthunter.service.GrantSyncService;
import com.granthunter.service.InstitutionReclassificationService;
import com.granthunter.service.MatchingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grants")
@RequiredArgsConstructor
@Tag(name = "지원사업 공고")
public class GrantController {

    private final GrantNoticeRepository noticeRepository;
    private final GrantSyncService grantSyncService;
    private final InstitutionReclassificationService reclassificationService;
    private final GrantNoticeService grantNoticeService;
    private final MatchingService matchingService;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    @GetMapping
    @Operation(summary = "공고 목록 조회")
    public ResponseEntity<Page<GrantNoticeResponse>> listGrants(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String excludeSource,
            @RequestParam(required = false) String applyEndFrom,
            @RequestParam(required = false) String applyEndTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "deadline") String sort) {

        String effectiveKeyword = keyword != null ? keyword : search;
        if (effectiveKeyword == null) effectiveKeyword = "";
        Sort sortSpec = resolveSort(sort);
        PageRequest pageRequest = PageRequest.of(page, size, sortSpec);
        LocalDate today = LocalDate.now();

        Page<GrantNotice> notices = noticeRepository.findActiveNotices(
                today,
                normalizeSourceParam(source),
                normalizeSourceParam(excludeSource),
                category,
                effectiveKeyword,
                parseDate(applyEndFrom),
                parseDate(applyEndTo),
                pageRequest);

        return ResponseEntity.ok(notices.map(this::toSummaryResponse));
    }

    @GetMapping("/active-count")
    @Operation(summary = "신청 가능 공고 수 (경량)")
    public ResponseEntity<Map<String, Long>> activeCount(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String excludeSource) {
        long total = noticeRepository.countActiveNoticesFiltered(
                LocalDate.now(),
                normalizeSourceParam(source),
                normalizeSourceParam(excludeSource));
        return ResponseEntity.ok(Map.of("total", total));
    }

    @GetMapping("/sources")
    @Operation(summary = "수집 소스 목록")
    public ResponseEntity<List<Map<String, String>>> listSources() {
        List<Map<String, String>> sources = Arrays.stream(GrantSource.values())
                .map(s -> Map.of(
                        "code", s.name(),
                        "label", s.getLabel(),
                        "method", s.getMethod()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sources);
    }

    @GetMapping("/sync/status")
    @Operation(summary = "동기화 현황")
    public ResponseEntity<Map<String, Object>> syncStatus() {
        return ResponseEntity.ok(grantSyncService.getStatus());
    }

    @PostMapping("/sync")
    @Operation(summary = "전체 소스 동기화")
    public ResponseEntity<Map<String, Object>> syncAll() {
        return ResponseEntity.ok(grantSyncService.syncAll());
    }

    @PostMapping("/sync/{source}")
    @Operation(summary = "특정 소스 동기화")
    public ResponseEntity<Map<String, Object>> syncSource(@PathVariable String source) {
        return ResponseEntity.ok(grantSyncService.syncSource(source));
    }

    @PostMapping("/reclassify-institutions")
    @Operation(summary = "기업마당 공고를 기관별 소스로 재분류")
    public ResponseEntity<Map<String, Object>> reclassifyInstitutions() {
        return ResponseEntity.ok(reclassificationService.reclassifyActiveBizinfo());
    }

    @GetMapping("/scores")
    @Operation(summary = "공고 매칭 점수 (ids 지정 시 해당 공고만)")
    public ResponseEntity<List<Object>> getMatchingScores(
            @RequestParam(required = false) List<Long> ids,
            Authentication auth) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        User user = resolveOptionalUser(auth);
        LocalDate today = LocalDate.now();
        List<Object> scores = noticeRepository.findAllById(ids.stream().limit(50).toList()).stream()
                .filter(n -> "ACTIVE".equalsIgnoreCase(n.getStatus()) && !n.getApplyEnd().isBefore(today))
                .filter(n -> n.getSource() == null || !Set.of("G2B", "G2B_AWARD").contains(n.getSource().toUpperCase(Locale.ROOT)))
                .map(notice -> {
                    MatchingScoreResponse score = user != null
                            ? matchingService.scoreNotice(notice, user)
                            : matchingService.scoreNotice(notice, null);
                    Map<String, Object> item = new HashMap<>();
                    item.put("noticeId", notice.getId());
                    item.put("title", notice.getTitle());
                    item.put("score", score.getMatchScore());
                    item.put("matchedIndustry", score.isMatchedIndustry());
                    item.put("matchedCategory", score.isMatchedCategory());
                    item.put("matchedSize", score.isMatchedSize());
                    item.put("matchReasons", score.getMatchReasons());
                    return item;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(scores);
    }

    private User resolveOptionalUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        try {
            return authenticatedUserResolver.resolveUser(Long.parseLong(auth.getName()));
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "공고 상세 조회")
    public ResponseEntity<GrantNoticeResponse> getGrant(@PathVariable Long id) {
        GrantNotice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다. ID: " + id));
        return ResponseEntity.ok(toResponse(notice));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "관련 공고 조회")
    public ResponseEntity<Map<String, Object>> getRelated(@PathVariable Long id) {
        GrantNotice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        LocalDate today = LocalDate.now();
        List<GrantNoticeResponse> related = noticeRepository
                .findRelatedActiveNotices(notice.getCategory(), id, today, PageRequest.of(0, 3))
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("content", related);
        result.put("total", related.size());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/fetch")
    @Operation(summary = "공공데이터 API 연동 (기업마당)")
    public ResponseEntity<Map<String, Object>> fetchFromPublicData() {
        return ResponseEntity.ok(grantSyncService.syncSource("bizinfo"));
    }

    @PostMapping("/scrape")
    @Operation(summary = "외부 수집 데이터 저장")
    public ResponseEntity<Map<String, Object>> saveScraped(@RequestBody Map<String, Object> body) {
        String source = GrantSource.normalize((String) body.getOrDefault("source", "MANUAL"));
        String sourceId = (String) body.getOrDefault("sourceId", String.valueOf(System.currentTimeMillis()));

        GrantNotice notice = GrantNotice.builder()
                .source(source)
                .sourceId(sourceId)
                .title((String) body.getOrDefault("title", ""))
                .organization((String) body.getOrDefault("organization", ""))
                .category((String) body.getOrDefault("category", "기타"))
                .applyStart(parseDate(body, "applyStart"))
                .applyEnd(parseDate(body, "applyEnd"))
                .budget((String) body.getOrDefault("budget", ""))
                .content((String) body.getOrDefault("content", ""))
                .eligibility((String) body.getOrDefault("eligibility", ""))
                .requirements((String) body.getOrDefault("requirements", ""))
                .url((String) body.getOrDefault("url", ""))
                .status("ACTIVE")
                .scrapedAt(ZonedDateTime.now())
                .build();

        GrantNoticeService.UpsertResult result = grantNoticeService.upsert(notice);
        Map<String, Object> response = new HashMap<>();
        response.put("status", result == GrantNoticeService.UpsertResult.CREATED ? "saved" : "updated");
        response.put("upsert", result.name());
        return ResponseEntity.ok(response);
    }

    private Sort resolveSort(String sort) {
        return switch (sort != null ? sort : "deadline") {
            case "latest" -> Sort.by(Sort.Direction.DESC, "scrapedAt");
            case "title" -> Sort.by("title");
            default -> Sort.by("applyEnd").ascending();
        };
    }

    private String normalizeSourceParam(String source) {
        if (source == null || source.isBlank() || "전체".equals(source)) return null;
        return GrantSource.normalize(source);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseDate(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (val instanceof String s && !s.isEmpty()) {
            return parseDate(s);
        }
        return null;
    }

    private GrantNoticeResponse toSummaryResponse(GrantNotice notice) {
        GrantSource source = GrantSource.fromName(notice.getSource()).orElse(GrantSource.MANUAL);
        return GrantNoticeResponse.builder()
                .id(notice.getId())
                .source(notice.getSource())
                .sourceLabel(source.getLabel())
                .sourceId(notice.getSourceId())
                .title(notice.getTitle())
                .organization(notice.getOrganization())
                .category(notice.getCategory())
                .industryTags(notice.getIndustryTags())
                .applyStart(notice.getApplyStart())
                .applyEnd(notice.getApplyEnd())
                .budget(notice.getBudget())
                .eligibility(notice.getEligibility())
                .url(notice.getUrl())
                .originalUrl(notice.getUrl())
                .status(notice.getStatus())
                .scrapedAt(notice.getScrapedAt())
                .build();
    }

    private GrantNoticeResponse toResponse(GrantNotice notice) {
        GrantSource source = GrantSource.fromName(notice.getSource()).orElse(GrantSource.MANUAL);
        return GrantNoticeResponse.builder()
                .id(notice.getId())
                .source(notice.getSource())
                .sourceLabel(source.getLabel())
                .sourceId(notice.getSourceId())
                .title(notice.getTitle())
                .organization(notice.getOrganization())
                .category(notice.getCategory())
                .industryTags(notice.getIndustryTags())
                .applyStart(notice.getApplyStart())
                .applyEnd(notice.getApplyEnd())
                .budget(notice.getBudget())
                .eligibility(notice.getEligibility())
                .requirements(notice.getRequirements())
                .url(notice.getUrl())
                .originalUrl(notice.getUrl())
                .content(notice.getContent())
                .status(notice.getStatus())
                .scrapedAt(notice.getScrapedAt())
                .build();
    }
}
