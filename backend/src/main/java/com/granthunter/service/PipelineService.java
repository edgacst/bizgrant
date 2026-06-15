package com.granthunter.service;

import com.granthunter.dto.PipelineItemResponse;
import com.granthunter.entity.GrantNotice;
import com.granthunter.entity.PipelineItem;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.PipelineItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PipelineService {

    private static final List<String> STAGE_ORDER = List.of(
            "DISCOVERED", "REVIEWING", "PREPARING", "SUBMITTED", "WAITING", "SELECTED", "REJECTED"
    );

    private static final Map<String, String> STAGE_COLORS = Map.of(
            "DISCOVERED", "indigo",
            "REVIEWING", "amber",
            "PREPARING", "blue",
            "SUBMITTED", "green",
            "WAITING", "purple",
            "SELECTED", "cyan",
            "REJECTED", "red"
    );

    private final PipelineItemRepository pipelineRepo;
    private final GrantNoticeRepository grantRepo;
    private final PlanService planService;

    public List<PipelineItemResponse> listForUser(Long userId) {
        return pipelineRepo.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PipelineItemResponse addItem(Long userId, Long grantId, String stage, String notes) {
        planService.assertCanAddPipelineItem(userId);
        if (pipelineRepo.findByUserIdAndGrantId(userId, grantId).isPresent()) {
            throw new IllegalArgumentException("이미 파이프라인에 추가된 공고입니다.");
        }

        GrantNotice grant = grantRepo.findById(grantId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        String stageUpper = normalizeStage(stage);
        PipelineItem item = PipelineItem.builder()
                .userId(userId)
                .grantId(grantId)
                .stage(stageUpper)
                .notes(notes != null ? notes : "")
                .expectedBudget(grant.getBudget())
                .build();

        return toResponse(pipelineRepo.save(item));
    }

    @Transactional
    public PipelineItemResponse moveItem(Long userId, Long grantId, String stage) {
        PipelineItem item = pipelineRepo.findByUserIdAndGrantId(userId, grantId)
                .orElseThrow(() -> new IllegalArgumentException("파이프라인 항목을 찾을 수 없습니다."));
        item.setStage(normalizeStage(stage));
        return toResponse(pipelineRepo.save(item));
    }

    @Transactional
    public PipelineItemResponse updateItem(Long userId, Long grantId, String notes, String documents) {
        PipelineItem item = pipelineRepo.findByUserIdAndGrantId(userId, grantId)
                .orElseThrow(() -> new IllegalArgumentException("파이프라인 항목을 찾을 수 없습니다."));

        if (notes != null) {
            item.setNotes(notes);
        }
        if (documents != null) {
            item.setDocuments(documents);
        }

        return toResponse(pipelineRepo.save(item));
    }

    @Transactional
    public void removeItem(Long userId, Long grantId) {
        PipelineItem item = pipelineRepo.findByUserIdAndGrantId(userId, grantId)
                .orElseThrow(() -> new IllegalArgumentException("파이프라인 항목을 찾을 수 없습니다."));
        pipelineRepo.delete(item);
    }

    public Map<String, Object> statsForUser(Long userId) {
        List<PipelineItem> items = pipelineRepo.findByUserId(userId);
        LocalDate today = LocalDate.now();

        Map<String, Long> stageCounts = new LinkedHashMap<>();
        for (String stage : STAGE_ORDER) {
            stageCounts.put(stage, 0L);
        }
        for (PipelineItem item : items) {
            stageCounts.merge(item.getStage(), 1L, Long::sum);
        }

        List<Map<String, Object>> byStage = new ArrayList<>();
        for (Map.Entry<String, Long> entry : stageCounts.entrySet()) {
            if (entry.getValue() == 0) {
                continue;
            }
            byStage.add(Map.of(
                    "stage", entry.getKey().toLowerCase(),
                    "count", entry.getValue(),
                    "totalBudget", "",
                    "color", STAGE_COLORS.getOrDefault(entry.getKey(), "gray")
            ));
        }

        long urgentCount = items.stream()
                .map(item -> grantRepo.findById(item.getGrantId()).orElse(null))
                .filter(Objects::nonNull)
                .filter(grant -> grant.getApplyEnd() != null)
                .filter(grant -> {
                    long days = ChronoUnit.DAYS.between(today, grant.getApplyEnd());
                    return days >= 0 && days <= 7;
                })
                .count();

        long selected = stageCounts.getOrDefault("SELECTED", 0L);
        long rejected = stageCounts.getOrDefault("REJECTED", 0L);
        long finished = selected + rejected;
        int successRate = finished > 0 ? (int) Math.round((selected * 100.0) / finished) : 0;

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", items.size());
        stats.put("byStage", byStage);
        stats.put("totalBudget", items.isEmpty() ? "0원" : "집계 중");
        stats.put("urgentCount", urgentCount);
        stats.put("successRate", successRate);
        return stats;
    }

    private PipelineItemResponse toResponse(PipelineItem item) {
        GrantNotice grant = grantRepo.findById(item.getGrantId()).orElse(null);
        LocalDate applyEnd = grant != null ? grant.getApplyEnd() : null;
        Integer daysLeft = null;
        if (applyEnd != null) {
            daysLeft = (int) ChronoUnit.DAYS.between(LocalDate.now(), applyEnd);
        }

        return PipelineItemResponse.builder()
                .id(item.getId())
                .grantId(item.getGrantId())
                .title(grant != null ? grant.getTitle() : "공고 #" + item.getGrantId())
                .organization(grant != null ? grant.getOrganization() : "")
                .category(grant != null ? grant.getCategory() : "기타")
                .budget(grant != null && grant.getBudget() != null ? grant.getBudget() : item.getExpectedBudget())
                .stage(item.getStage())
                .dueDate(applyEnd != null ? applyEnd.toString() : "")
                .notes(item.getNotes() != null ? item.getNotes() : "")
                .documents(parseDocuments(item.getDocuments()))
                .daysLeft(daysLeft)
                .totalAmount(item.getExpectedBudget())
                .originalUrl(grant != null ? grant.getUrl() : null)
                .build();
    }

    private List<String> parseDocuments(String documents) {
        if (documents == null || documents.isBlank()) {
            return List.of();
        }
        if (documents.startsWith("[") && documents.endsWith("]")) {
            String inner = documents.substring(1, documents.length() - 1);
            if (inner.isBlank()) {
                return List.of();
            }
            return Arrays.stream(inner.split(","))
                    .map(String::trim)
                    .map(s -> s.replaceAll("^\"|\"$", ""))
                    .filter(s -> !s.isBlank())
                    .toList();
        }
        return List.of(documents);
    }

    private String normalizeStage(String stage) {
        if (stage == null || stage.isBlank()) {
            return "DISCOVERED";
        }
        String normalized = stage.toUpperCase();
        if (!normalized.matches("DISCOVERED|REVIEWING|PREPARING|SUBMITTED|WAITING|SELECTED|REJECTED")) {
            return "DISCOVERED";
        }
        return normalized;
    }
}
