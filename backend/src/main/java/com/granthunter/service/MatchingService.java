package com.granthunter.service;

import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.entity.AlertPref;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.User;
import com.granthunter.repository.AlertPrefRepository;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 사용자-공고 매칭 서비스
 * 사용자의 관심사와 공고 정보를 비교하여 매칭 점수를 계산합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final GrantNoticeRepository noticeRepository;
    private final AlertPrefRepository alertPrefRepository;
    private final UserRepository userRepository;
    private final PlanService planService;

    /**
     * 특정 사용자에게 매칭되는 공고 목록 조회
     */
    public List<MatchingScoreResponse> findMatchesForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        AlertPref prefs = alertPrefRepository.findByUserId(userId)
                .orElse(null);

        LocalDate today = LocalDate.now();
        List<GrantNotice> candidates;

        // 알림 설정이 있으면 카테고리로 1차 필터링
        if (prefs != null && prefs.getCategories() != null && !prefs.getCategories().isEmpty()) {
            List<String> categories = parseCommaSeparated(prefs.getCategories());
            candidates = noticeRepository.findActiveSupportGrantNotices(today).stream()
                    .filter(notice -> {
                        String noticeCat = notice.getCategory() != null
                                ? notice.getCategory().toLowerCase(Locale.ROOT) : "";
                        return categories.stream()
                                .map(String::toLowerCase)
                                .anyMatch(cat -> noticeCat.contains(cat) || cat.contains(noticeCat));
                    })
                    .toList();
        } else {
            // 설정이 없으면 모든 활성 공고 대상
            candidates = noticeRepository.findActiveSupportGrantNotices(today);
        }

        return planService.applyMatchListLimits(user, candidates.stream()
                .map(notice -> calculateMatchScore(notice, user, prefs))
                .filter(match -> match.getMatchScore() >= ((prefs != null && hasMatchingPrefs(prefs)) ? 25 : 15))
                .sorted(Comparator.comparingInt(MatchingScoreResponse::getMatchScore).reversed())
                .limit(50)
                .collect(Collectors.toList()));
    }

    private boolean hasMatchingPrefs(AlertPref prefs) {
        return (prefs.getCategories() != null && !prefs.getCategories().isBlank())
                || (prefs.getIndustries() != null && !prefs.getIndustries().isBlank())
                || (prefs.getMinBudget() != null && prefs.getMinBudget() > 0);
    }

    public MatchingScoreResponse scoreNotice(GrantNotice notice, User user) {
        AlertPref prefs = user != null
                ? alertPrefRepository.findByUserId(user.getId()).orElse(null)
                : null;
        MatchingScoreResponse score = calculateMatchScore(notice, user, prefs);
        return user != null ? planService.applyScoreLimits(user, score) : score;
    }

    public MatchingScoreResponse scoreNoticeForUser(Long userId, GrantNotice notice) {
        User user = userRepository.findById(userId).orElse(null);
        return scoreNotice(notice, user);
    }

    /**
     * 개별 공고-사용자 간 매칭 점수 계산 (0~100)
     */
    public MatchingScoreResponse calculateMatchScore(GrantNotice notice, User user, AlertPref prefs) {
        List<String> reasons = new ArrayList<>();
        int score = 0;
        boolean matchedCategory = false;
        boolean matchedIndustry = false;
        boolean matchedSize = false;

        if (user == null) {
            return MatchingScoreResponse.builder()
                    .noticeId(notice.getId())
                    .title(notice.getTitle())
                    .matchScore(0)
                    .matchReasons(List.of())
                    .matchedCategory(false)
                    .matchedIndustry(false)
                    .matchedSize(false)
                    .build();
        }

        // 1. 카테고리 매칭 (최대 35점)
        if (prefs != null && prefs.getCategories() != null && !prefs.getCategories().isEmpty()) {
            List<String> prefCats = parseCommaSeparated(prefs.getCategories().toLowerCase());
            String noticeCat = notice.getCategory() != null ? notice.getCategory().toLowerCase() : "";
            if (prefCats.stream().anyMatch(noticeCat::contains) ||
                prefCats.stream().anyMatch(cat -> cat.contains(noticeCat))) {
                score += 35;
                matchedCategory = true;
                reasons.add("관심 카테고리 일치: " + notice.getCategory());
            }
        } else if (user.getIndustry() != null || user.getCompanySize() != null) {
            score += 15;
            reasons.add("프로필 기반 기본 추천");
        } else {
            score += 10;
            reasons.add("일반 추천");
        }

        // 2. 산업군 매칭 (최대 25점)
        if (prefs != null && prefs.getIndustries() != null && !prefs.getIndustries().isEmpty()) {
            if (notice.getIndustryTags() != null && !notice.getIndustryTags().isEmpty()) {
                List<String> prefInds = parseCommaSeparated(prefs.getIndustries().toLowerCase());
                List<String> noticeInds = parseCommaSeparated(notice.getIndustryTags().toLowerCase());
                long matchCount = prefInds.stream()
                        .filter(pi -> noticeInds.stream().anyMatch(ni -> industriesMatch(pi, ni)))
                        .count();
                if (matchCount > 0) {
                    int indScore = (int) Math.min(25, matchCount * 10);
                    score += indScore;
                    matchedIndustry = true;
                    reasons.add("관심 산업군 " + matchCount + "개 일치");
                }
            }
        }
        // 사용자 프로필의 산업군과도 비교
        if (user.getIndustry() != null && notice.getIndustryTags() != null) {
            List<String> noticeInds = parseCommaSeparated(notice.getIndustryTags().toLowerCase());
            String userInd = user.getIndustry().toLowerCase();
            if (noticeInds.stream().anyMatch(ni -> industriesMatch(userInd, ni))
                    || titleOrContentMentionsIndustry(notice, userInd)) {
                score += 15;
                matchedIndustry = true;
                reasons.add("회사 산업군 일치: " + user.getIndustry());
            }
        }

        // 3. 예산 규모 매칭 (최대 15점)
        if (prefs != null && prefs.getMinBudget() != null && prefs.getMinBudget() > 0) {
            Long noticeBudget = extractBudgetAmount(notice.getBudget());
            if (noticeBudget != null && noticeBudget >= prefs.getMinBudget()) {
                score += 15;
                reasons.add("지원금액 조건 충족 (최소 " + formatBudget(prefs.getMinBudget()) + ")");
            }
        }

        // 4. 마감 임박 가점 (최대 15점, 일주일 이내 +10, 3일 이내 +15)
        if (notice.getApplyEnd() != null) {
            long daysUntilDeadline = ChronoUnit.DAYS.between(LocalDate.now(), notice.getApplyEnd());
            if (daysUntilDeadline <= 3 && daysUntilDeadline >= 0) {
                score += 15;
                reasons.add("마감 3일 이내 임박!");
            } else if (daysUntilDeadline <= 7 && daysUntilDeadline >= 0) {
                score += 10;
                reasons.add("마감 1주일 이내");
            } else if (daysUntilDeadline <= 30 && daysUntilDeadline >= 0) {
                score += 5;
                reasons.add("마감 30일 이내");
            }
        }

        // 5. 제목 키워드 매칭 보너스 (최대 10점)
        if (user.getIndustry() != null && notice.getTitle() != null) {
            if (titleOrContentMentionsIndustry(notice, user.getIndustry().toLowerCase())) {
                score += 5;
                reasons.add("공고 제목/내용에 산업 키워드 포함");
            }
        }
        if (user.getCompanySize() != null && notice.getContent() != null) {
            String sizeKeyword = mapCompanySize(user.getCompanySize());
            String eligibility = notice.getEligibility() != null ? notice.getEligibility() : "";
            if (sizeKeyword != null && (notice.getContent().contains(sizeKeyword) || eligibility.contains(sizeKeyword))) {
                score += 5;
                matchedSize = true;
                reasons.add("기업규모 관련 지원대상 포함");
            }
        }

        int eligibilityScore = scoreEligibilityKeywords(notice, user, reasons);
        score += eligibilityScore;
        if (eligibilityScore >= 10) {
            matchedIndustry = true;
        }

        // 점수 상한 100
        score = Math.min(100, score);

        return MatchingScoreResponse.builder()
                .noticeId(notice.getId())
                .title(notice.getTitle())
                .organization(notice.getOrganization())
                .category(notice.getCategory())
                .industryTags(notice.getIndustryTags())
                .applyStart(notice.getApplyStart())
                .applyEnd(notice.getApplyEnd())
                .budget(notice.getBudget())
                .url(notice.getUrl())
                .matchScore(score)
                .matchReasons(reasons)
                .matchedCategory(matchedCategory)
                .matchedIndustry(matchedIndustry)
                .matchedSize(matchedSize)
                .build();
    }

    private boolean industriesMatch(String left, String right) {
        if (left == null || right == null) {
            return false;
        }
        String a = left.toLowerCase(Locale.ROOT).trim();
        String b = right.toLowerCase(Locale.ROOT).trim();
        if (a.contains(b) || b.contains(a)) {
            return true;
        }
        for (String alias : industryAliases(a)) {
            if (b.contains(alias) || alias.contains(b)) {
                return true;
            }
        }
        for (String alias : industryAliases(b)) {
            if (a.contains(alias) || alias.contains(a)) {
                return true;
            }
        }
        return false;
    }

    private List<String> industryAliases(String industry) {
        return INDUSTRY_ALIASES.getOrDefault(industry, List.of(industry));
    }

    private boolean titleOrContentMentionsIndustry(GrantNotice notice, String industry) {
        String haystack = ((notice.getTitle() != null ? notice.getTitle() : "") + " "
                + (notice.getContent() != null ? notice.getContent() : "") + " "
                + (notice.getEligibility() != null ? notice.getEligibility() : "")).toLowerCase(Locale.ROOT);
        for (String alias : industryAliases(industry)) {
            if (haystack.contains(alias)) {
                return true;
            }
        }
        return haystack.contains(industry);
    }

    private static final Map<String, List<String>> INDUSTRY_ALIASES = Map.ofEntries(
            Map.entry("it/소프트웨어", List.of("it", "sw", "소프트웨어", "ict", "ai", "정보통신", "디지털")),
            Map.entry("제조/하드웨어", List.of("제조", "생산", "공장", "하드웨어", "스마트팩토리")),
            Map.entry("서비스/유통", List.of("서비스", "유통", "물류", "관광", "리테일")),
            Map.entry("건설/인테리어", List.of("건설", "인테리어", "부동산")),
            Map.entry("교육/컨설팅", List.of("교육", "컨설팅", "훈련")),
            Map.entry("바이오/헬스케어", List.of("바이오", "헬스", "의료", "제약", "헬스케어")),
            Map.entry("문화/콘텐츠", List.of("문화", "콘텐츠", "미디어", "게임", "영상")),
            Map.entry("프리랜서/개인", List.of("1인", "프리랜서", "개인사업", "소상공"))
    );

    /**
     * 콤마 구분 문자열 파싱
     */
    private List<String> parseCommaSeparated(String text) {
        if (text == null || text.trim().isEmpty()) return Collections.emptyList();
        return Arrays.stream(text.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * 예산 문자열에서 금액 추출 (단위: 원)
     * 예: "총 50억원", "100백만원", "5,000만원"
     */
    private Long extractBudgetAmount(String budgetText) {
        if (budgetText == null || budgetText.isEmpty()) return null;

        try {
            // 숫자와 단위 추출
            Pattern p = Pattern.compile("([\\d,]+)\\s*(억|백만|천만|만|조)?");
            Matcher m = p.matcher(budgetText.replaceAll("\\s+", ""));
            if (m.find()) {
                String numStr = m.group(1).replace(",", "");
                BigDecimal amount = new BigDecimal(numStr);
                String unit = m.group(2);

                if (unit != null) {
                    switch (unit) {
                        case "조": amount = amount.multiply(BigDecimal.valueOf(1_000_000_000_000L)); break;
                        case "억": amount = amount.multiply(BigDecimal.valueOf(100_000_000)); break;
                        case "백만": amount = amount.multiply(BigDecimal.valueOf(1_000_000)); break;
                        case "천만": amount = amount.multiply(BigDecimal.valueOf(10_000_000)); break;
                        case "만": amount = amount.multiply(BigDecimal.valueOf(10_000)); break;
                    }
                }

                return amount.longValue();
            }
        } catch (Exception e) {
            log.debug("예산 금액 파싱 실패: {}", budgetText);
        }
        return null;
    }

    private String formatBudget(Long amount) {
        if (amount >= 100_000_000) {
            return (amount / 100_000_000) + "억원";
        } else if (amount >= 10_000) {
            return (amount / 10_000) + "만원";
        }
        return String.format("%,d원", amount);
    }

    private int scoreEligibilityKeywords(GrantNotice notice, User user, List<String> reasons) {
        String haystack = ((notice.getEligibility() != null ? notice.getEligibility() : "") + " "
                + (notice.getTitle() != null ? notice.getTitle() : "")).toLowerCase(Locale.ROOT);
        if (haystack.isBlank()) {
            return 0;
        }

        int score = 0;
        if (user.getIndustry() != null) {
            for (String alias : industryAliases(user.getIndustry().toLowerCase(Locale.ROOT))) {
                if (haystack.contains(alias)) {
                    score += 10;
                    reasons.add("지원대상에 회사 업종 키워드 포함");
                    break;
                }
            }
        }

        if (user.getCompanySize() != null) {
            String sizeKeyword = mapCompanySize(user.getCompanySize());
            if (sizeKeyword != null && haystack.contains(sizeKeyword.toLowerCase(Locale.ROOT))) {
                score += 10;
                reasons.add("지원대상에 기업 규모 조건 포함");
            }
        }

        if (user.getCompanyName() != null && !user.getCompanyName().isBlank()) {
            if (haystack.contains("중소기업") || haystack.contains("중소벤처")) {
                score += 5;
            }
        }

        return Math.min(20, score);
    }

    private String mapCompanySize(String size) {
        if (size == null) return null;
        return switch (size.toLowerCase()) {
            case "startup", "스타트업", "창업" -> "창업기업";
            case "small", "소기업", "소상공인" -> "소기업";
            case "medium", "중기업", "중소기업" -> "중소기업";
            case "large", "대기업", "중견기업" -> "중견기업";
            default -> null;
        };
    }
}
