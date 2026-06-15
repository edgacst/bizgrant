package com.granthunter.service;

import com.granthunter.entity.GrantSyncRun;
import com.granthunter.entity.User;
import com.granthunter.entity.UserRole;
import com.granthunter.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final GrantNoticeRepository grantNoticeRepository;
    private final NewsletterSubscriberRepository newsletterSubscriberRepository;
    private final PipelineItemRepository pipelineItemRepository;
    private final AlertPrefRepository alertPrefRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final GrantSyncRunRepository grantSyncRunRepository;
    private final GrantSyncService grantSyncService;
    private final NewsletterService newsletterService;
    private final PlanService planService;

    public Map<String, Object> getDashboard() {
        LocalDate today = LocalDate.now();
        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("users", Map.of(
                "total", userRepository.count(),
                "admins", userRepository.countByRoleIgnoreCase("ADMIN")
        ));
        dashboard.put("grants", Map.of(
                "active", grantNoticeRepository.countActiveNotices(today),
                "total", grantNoticeRepository.count()
        ));
        dashboard.put("newsletter", newsletterService.getStats());
        dashboard.put("pipeline", Map.of(
                "totalItems", pipelineItemRepository.count()
        ));
        dashboard.put("sync", grantSyncService.getStatus());
        dashboard.put("recentUsers", listRecentUsers(15));
        dashboard.put("recentSyncRuns", toSyncRunSummaries(
                grantSyncRunRepository.findTop20ByOrderByStartedAtDesc().stream().limit(10).toList()
        ));
        return dashboard;
    }

    public List<Map<String, Object>> listRecentUsers(int limit) {
        return userRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(this::toUserSummary)
                .collect(Collectors.toList());
    }

    public Map<String, Object> triggerSync() {
        return grantSyncService.syncAll();
    }

    public Map<String, Object> triggerNewsletter() {
        return newsletterService.sendWeeklyDigest();
    }

    @Transactional
    public Map<String, Object> updateUserPlan(Long targetUserId, String plan) {
        planService.updateUserPlan(targetUserId, plan);
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "success");
        result.put("userId", targetUserId);
        result.put("plan", user.getPlan());
        return result;
    }

    @Transactional
    public Map<String, Object> deleteUser(Long adminUserId, Long targetUserId) {
        if (adminUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("본인 계정은 삭제할 수 없습니다.");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (UserRole.ADMIN.equalsIgnoreCase(target.getRole())) {
            throw new IllegalArgumentException("관리자 계정은 삭제할 수 없습니다.");
        }

        pipelineItemRepository.deleteByUserId(targetUserId);
        alertPrefRepository.deleteByUserId(targetUserId);
        alertHistoryRepository.deleteByUserId(targetUserId);
        userRepository.delete(target);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "success");
        result.put("deletedUserId", targetUserId);
        result.put("email", target.getEmail());
        return result;
    }

    private Map<String, Object> toUserSummary(User user) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", user.getId());
        item.put("email", user.getEmail());
        item.put("name", user.getName());
        item.put("companyName", user.getCompanyName());
        item.put("plan", user.getPlan());
        item.put("role", user.getRole());
        item.put("status", user.getStatus());
        item.put("createdAt", user.getCreatedAt());
        return item;
    }

    private List<Map<String, Object>> toSyncRunSummaries(List<GrantSyncRun> runs) {
        return runs.stream().map(run -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", run.getId());
            item.put("source", run.getSource());
            item.put("status", run.getStatus());
            item.put("fetched", run.getFetched());
            item.put("created", run.getCreated());
            item.put("updated", run.getUpdated());
            item.put("failed", run.getFailed());
            item.put("message", run.getMessage());
            item.put("startedAt", run.getStartedAt());
            item.put("finishedAt", run.getFinishedAt());
            return item;
        }).collect(Collectors.toList());
    }
}
