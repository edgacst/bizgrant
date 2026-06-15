package com.granthunter.service;

import com.granthunter.collector.CollectorResult;
import com.granthunter.collector.GrantCollector;
import com.granthunter.collector.GrantSource;
import com.granthunter.collector.InstitutionProfile;
import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantSyncRun;
import com.granthunter.repository.GrantNoticeRepository;
import com.granthunter.repository.GrantSyncRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GrantSyncService {

    private final List<GrantCollector> collectors;
    private final GrantSyncRunRepository syncRunRepository;
    private final GrantNoticeRepository noticeRepository;
    private final GrantSyncProperties properties;

    @Scheduled(cron = "${app.grant-sync.cron:0 0 8,16 * * *}")
    public void scheduledSync() {
        if (!properties.isEnabled()) {
            return;
        }
        log.info("=== 정부 지원사업 자동 동기화 시작 ===");
        syncAll();
        log.info("=== 정부 지원사업 자동 동기화 완료 ===");
    }

    public Map<String, Object> syncAll() {
        List<CollectorResult> results = new ArrayList<>();
        for (GrantCollector collector : collectors) {
            if (!collector.isEnabled()) {
                log.info("{} 수집기 비활성화 — 건너뜀", collector.getSource().getLabel());
                continue;
            }
            results.add(runCollector(collector));
        }
        return buildSummary(results);
    }

    public Map<String, Object> syncSource(String sourceName) {
        GrantSource source = GrantSource.fromName(sourceName)
                .orElseThrow(() -> new IllegalArgumentException("지원하지 않는 소스: " + sourceName));

        GrantCollector collector = collectors.stream()
                .filter(c -> c.getSource() == source)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("수집기 없음: " + sourceName));

        CollectorResult result = runCollector(collector);
        return buildSummary(List.of(result));
    }

    private CollectorResult runCollector(GrantCollector collector) {
        GrantSyncRun run = GrantSyncRun.builder()
                .source(collector.getSource().name())
                .status("RUNNING")
                .startedAt(ZonedDateTime.now())
                .build();
        syncRunRepository.save(run);

        try {
            CollectorResult result = collector.collect();
            run.setStatus("SUCCESS");
            run.setFetched(result.getFetched());
            run.setCreated(result.getCreated());
            run.setUpdated(result.getUpdated());
            run.setSkipped(result.getSkipped());
            run.setFailed(result.getFailed());
            run.setMessage(result.getMessage());
            run.setFinishedAt(ZonedDateTime.now());
            syncRunRepository.save(run);
            log.info("{} 동기화 완료: {}", collector.getSource().getLabel(), result.getMessage());
            return result;
        } catch (Exception e) {
            run.setStatus("FAILED");
            run.setMessage(e.getMessage());
            run.setFailed(1);
            run.setFinishedAt(ZonedDateTime.now());
            syncRunRepository.save(run);
            log.error("{} 동기화 실패", collector.getSource().getLabel(), e);
            return CollectorResult.builder()
                    .source(collector.getSource())
                    .failed(1)
                    .message(e.getMessage())
                    .build();
        }
    }

    public Map<String, Object> getStatus() {
        LocalDate today = LocalDate.now();
        Map<String, Object> status = new LinkedHashMap<>();

        status.put("activeTotal", noticeRepository.countActiveNotices(today));
        status.put("totalAll", noticeRepository.count());
        status.put("bySource", noticeRepository.countActiveBySource(today));
        status.put("sources", buildSourceConfigs());
        status.put("recentRuns", syncRunRepository.findTop20ByOrderByStartedAtDesc());
        return status;
    }

    private List<Map<String, Object>> buildSourceConfigs() {
        List<Map<String, Object>> configs = new ArrayList<>();
        for (GrantSyncProperties.SourceConfig cfg : properties.getSources()) {
            GrantSource source = GrantSource.fromName(cfg.getName()).orElse(null);
            boolean hasCollector = collectors.stream()
                    .anyMatch(c -> matchesSource(c, cfg.getName()));

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", cfg.getName());
            item.put("label", source != null ? source.getLabel() : cfg.getName());
            item.put("enabled", cfg.isEnabled());
            item.put("type", cfg.getType());
            item.put("url", cfg.getUrl());
            item.put("implemented", hasCollector);
            configs.add(item);
        }
        return configs;
    }

    private boolean matchesSource(GrantCollector collector, String configName) {
        if (configName == null) {
            return false;
        }
        String normalized = configName.trim().toLowerCase().replace("-", "_");
        String collectorName = collector.getSource().name().toLowerCase();
        if (collectorName.equals(normalized)) {
            return true;
        }
        InstitutionProfile profile = InstitutionProfile.fromConfigName(configName);
        return profile != null && collector.getSource() == profile.getSource();
    }

    private Map<String, Object> buildSummary(List<CollectorResult> results) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("status", "success");
        summary.put("syncedAt", ZonedDateTime.now().toString());
        summary.put("activeTotal", noticeRepository.countActiveNotices(LocalDate.now()));
        summary.put("results", results);
        summary.put("totalCreated", results.stream().mapToInt(CollectorResult::getCreated).sum());
        summary.put("totalUpdated", results.stream().mapToInt(CollectorResult::getUpdated).sum());
        return summary;
    }
}
