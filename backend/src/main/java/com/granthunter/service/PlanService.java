package com.granthunter.service;

import com.granthunter.dto.AlertPrefRequest;
import com.granthunter.dto.MatchingScoreResponse;
import com.granthunter.dto.PlanInfoResponse;
import com.granthunter.entity.User;
import com.granthunter.exception.PlanLimitException;
import com.granthunter.plan.PlanLimits;
import com.granthunter.plan.PlanType;
import com.granthunter.repository.AlertHistoryRepository;
import com.granthunter.repository.BookmarkRepository;
import com.granthunter.repository.PipelineItemRepository;
import com.granthunter.repository.UserFileRepository;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final UserRepository userRepository;
    private final PipelineItemRepository pipelineItemRepository;
    private final BookmarkRepository bookmarkRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final UserFileRepository userFileRepository;

    public PlanType resolvePlan(User user) {
        if (user == null) {
            return PlanType.FREE;
        }
        return PlanType.fromCode(user.getPlan());
    }

    public PlanType resolvePlan(Long userId) {
        if (userId == null) {
            return PlanType.FREE;
        }
        return userRepository.findById(userId)
                .map(this::resolvePlan)
                .orElse(PlanType.FREE);
    }

    public PlanLimits limitsFor(User user) {
        return PlanLimits.forPlan(resolvePlan(user));
    }

    public PlanLimits limitsFor(Long userId) {
        return PlanLimits.forPlan(resolvePlan(userId));
    }

    public PlanInfoResponse getPlanInfo(Long userId) {
        PlanType planType = resolvePlan(userId);
        PlanLimits limits = PlanLimits.forPlan(planType);
        PlanInfoResponse.PlanUsageDto usage = userId == null ? null : PlanInfoResponse.PlanUsageDto.builder()
                .pipelineItems((int) pipelineItemRepository.findByUserId(userId).size())
                .bookmarks(bookmarkRepository.countByUserId(userId))
                .alertsSentToday((int) countAlertsSentToday(userId))
                .userFiles((int) userFileRepository.countByUserId(userId))
                .matchResultsCap(limits.isUnlimited(limits.maxMatchResults()) ? -1 : limits.maxMatchResults())
                .build();

        return PlanInfoResponse.builder()
                .plan(planType.getCode())
                .planLabel(planType.getLabel())
                .limits(PlanInfoResponse.toLimitsDto(limits))
                .usage(usage)
                .build();
    }

    public void requirePlanAtLeast(User user, PlanType minimum, String featureLabel) {
        PlanType current = resolvePlan(user);
        if (current == PlanType.ADMIN || current.ordinal() >= minimum.ordinal()) {
            return;
        }
        throw new PlanLimitException(
                featureLabel + "은(는) " + minimum.getLabel() + " 이상에서 이용할 수 있습니다.",
                current.getCode(),
                minimum.getCode()
        );
    }

    public void assertCanSaveChecklist(User user) {
        if (!limitsFor(user).checklistSaveEnabled()) {
            requirePlanAtLeast(user, PlanType.PRO, "서류 체크리스트 저장");
        }
    }

    public void assertCanAutofillTemplate(User user) {
        if (!limitsFor(user).templateAutofillEnabled()) {
            requirePlanAtLeast(user, PlanType.PRO, "프로필 자동완성 템플릿");
        }
    }

    public void assertCanAddPipelineItem(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        PlanLimits limits = limitsFor(user);
        if (limits.isUnlimited(limits.maxPipelineItems())) {
            return;
        }
        int count = pipelineItemRepository.findByUserId(userId).size();
        if (count >= limits.maxPipelineItems()) {
            throw new PlanLimitException(
                    "파이프라인은 Free 플랜에서 최대 " + limits.maxPipelineItems() + "건까지 등록할 수 있습니다. Pro로 업그레이드하면 무제한입니다.",
                    resolvePlan(user).getCode(),
                    PlanType.PRO.getCode()
            );
        }
    }

    public void assertCanAddBookmark(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        PlanLimits limits = limitsFor(user);
        if (limits.isUnlimited(limits.maxBookmarks())) {
            return;
        }
        int count = bookmarkRepository.countByUserId(userId);
        if (count >= limits.maxBookmarks()) {
            PlanType plan = resolvePlan(user);
            String upgradeHint = plan == PlanType.FREE ? " Pro로 업그레이드하면 50건까지 저장할 수 있습니다." : "";
            throw new PlanLimitException(
                    "북마크는 " + plan.getLabel() + " 플랜에서 최대 " + limits.maxBookmarks() + "건까지 저장할 수 있습니다." + upgradeHint,
                    plan.getCode(),
                    plan == PlanType.FREE ? PlanType.PRO.getCode() : PlanType.ENTERPRISE.getCode()
            );
        }
    }

    public void assertCanUploadFile(Long userId) {
        PlanLimits limits = limitsFor(userId);
        if (limits.isUnlimited(limits.maxUserFiles())) {
            return;
        }
        long count = userFileRepository.countByUserId(userId);
        if (count >= limits.maxUserFiles()) {
            throw new PlanLimitException(
                    "서류 보관함은 Free 플랜에서 최대 " + limits.maxUserFiles() + "개까지 저장할 수 있습니다.",
                    resolvePlan(userId).getCode(),
                    PlanType.PRO.getCode()
            );
        }
    }

    public void validateAlertPref(User user, AlertPrefRequest request) {
        PlanLimits limits = limitsFor(user);
        if (request.getCategories() != null && !request.getCategories().isBlank()) {
            int count = splitCsv(request.getCategories()).size();
            if (!limits.isUnlimited(limits.maxAlertCategories()) && count > limits.maxAlertCategories()) {
                throw new PlanLimitException(
                        "관심 카테고리는 " + limits.maxAlertCategories() + "개까지 선택할 수 있습니다.",
                        resolvePlan(user).getCode(),
                        count > limits.maxAlertCategories() && resolvePlan(user) == PlanType.FREE
                                ? PlanType.PRO.getCode() : null
                );
            }
        }
        if (request.getIndustries() != null && !request.getIndustries().isBlank()) {
            int count = splitCsv(request.getIndustries()).size();
            if (!limits.isUnlimited(limits.maxAlertIndustries()) && count > limits.maxAlertIndustries()) {
                throw new PlanLimitException(
                        "관심 업종은 " + limits.maxAlertIndustries() + "개까지 선택할 수 있습니다.",
                        resolvePlan(user).getCode(),
                        PlanType.PRO.getCode()
                );
            }
        }
        if (request.getChannel() != null && !request.getChannel().isBlank()) {
            String channel = request.getChannel().toLowerCase(Locale.ROOT);
            if (!limits.allowedAlertChannels().contains(channel)) {
                boolean enterpriseChannel = Set.of("slack", "telegram", "webhook").contains(channel);
                PlanType required = enterpriseChannel ? PlanType.ENTERPRISE : PlanType.PRO;
                throw new PlanLimitException(
                        channel + " 알림은 " + required.getLabel() + " 이상에서 설정할 수 있습니다.",
                        resolvePlan(user).getCode(),
                        required.getCode()
                );
            }
        }
    }

    public List<MatchingScoreResponse> applyMatchListLimits(User user, List<MatchingScoreResponse> matches) {
        PlanLimits limits = limitsFor(user);
        return matches.stream()
                .limit(limits.isUnlimited(limits.maxMatchResults()) ? Long.MAX_VALUE : limits.maxMatchResults())
                .map(match -> applyScoreLimits(user, match))
                .collect(Collectors.toCollection(ArrayList::new));
    }

    public MatchingScoreResponse applyScoreLimits(User user, MatchingScoreResponse match) {
        PlanLimits limits = limitsFor(user);
        if (limits.matchReasonsEnabled()) {
            return match;
        }
        match.setMatchReasons(null);
        if (!limits.matchFlagsEnabled()) {
            match.setMatchedCategory(false);
            match.setMatchedIndustry(false);
            match.setMatchedSize(false);
        }
        return match;
    }

    public List<MatchingScoreResponse> capAlertsForToday(User user, List<MatchingScoreResponse> candidates) {
        PlanLimits limits = limitsFor(user);
        if (limits.isUnlimited(limits.maxDailyAlerts())) {
            return candidates;
        }
        long sentToday = countAlertsSentToday(user.getId());
        int remaining = (int) Math.max(0, limits.maxDailyAlerts() - sentToday);
        if (remaining == 0) {
            return List.of();
        }
        return candidates.stream().limit(remaining).toList();
    }

    public void updateUserPlan(Long userId, String planCode) {
        PlanType planType = PlanType.fromCode(planCode);
        if (planType == PlanType.ADMIN) {
            throw new IllegalArgumentException("admin 플랜은 이 API로 변경할 수 없습니다.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        user.setPlan(planType.getCode());
        userRepository.save(user);
    }

    private long countAlertsSentToday(Long userId) {
        ZonedDateTime startOfDay = LocalDate.now(ZoneId.systemDefault())
                .atStartOfDay(ZoneId.systemDefault());
        return alertHistoryRepository.countByUserIdAndSentAtAfter(userId, startOfDay);
    }

    private List<String> splitCsv(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
