package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.service.GrantNoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.w3c.dom.Node;

import java.util.LinkedHashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstitutionBizinfoSync {

    private final GrantSyncProperties properties;
    private final BizinfoApiClient bizinfoApiClient;
    private final GrantNoticeService noticeService;

    public boolean isEnabled(InstitutionProfile profile) {
        return bizinfoApiClient.isConfigured()
                && properties.getSources().stream()
                .anyMatch(s -> profile.getConfigName().equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    public CollectorResult sync(InstitutionProfile profile) {
        if (!isEnabled(profile)) {
            return CollectorResult.builder()
                    .source(profile.getSource())
                    .message(profile.getDefaultOrganization() + " 비활성화 또는 API 키 없음")
                    .build();
        }

        int fetched = 0;
        int created = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;
        Set<String> seenIds = new LinkedHashSet<>();

        try {
            for (String keyword : profile.getSearchKeywords()) {
                int totalCount = bizinfoApiClient.fetchTotalCount(keyword);
                if (totalCount <= 0) {
                    continue;
                }

                int pageSize = properties.getPublicData().getPageSize();
                int totalPages = Math.min(
                        (totalCount + pageSize - 1) / pageSize,
                        properties.getMaxPagesPerSource());

                for (int page = 1; page <= totalPages; page++) {
                    BizinfoApiClient.PageResult pageResult = bizinfoApiClient.fetchPage(page, keyword);
                    for (Node item : pageResult.items) {
                        try {
                            GrantNotice notice = bizinfoApiClient.mapItem(item, profile.getSource());
                            if (notice == null || !profile.matches(
                                    notice.getOrganization(), "", notice.getTitle())) {
                                continue;
                            }
                            if (!seenIds.add(notice.getSourceId())) {
                                continue;
                            }
                            if (notice.getOrganization() == null || notice.getOrganization().isBlank()) {
                                notice.setOrganization(profile.getDefaultOrganization());
                            }
                            fetched++;
                            switch (noticeService.upsert(notice)) {
                                case CREATED -> created++;
                                case UPDATED -> updated++;
                                case SKIPPED -> skipped++;
                            }
                        } catch (Exception e) {
                            failed++;
                            log.debug("{} 저장 실패: {}", profile.getSource(), e.getMessage());
                        }
                    }
                    if (page < totalPages) {
                        Thread.sleep(properties.getPageDelayMs());
                    }
                }
            }

            return CollectorResult.builder()
                    .source(profile.getSource())
                    .fetched(fetched)
                    .created(created)
                    .updated(updated)
                    .skipped(skipped)
                    .failed(failed)
                    .message(String.format("%s %d건 처리 (신규 %d, 갱신 %d)",
                            profile.getDefaultOrganization(), fetched, created, updated))
                    .build();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CollectorResult.builder()
                    .source(profile.getSource())
                    .fetched(fetched)
                    .created(created)
                    .updated(updated)
                    .skipped(skipped)
                    .failed(failed)
                    .message("수집 중단됨")
                    .build();
        } catch (Exception e) {
            log.error("{} 기업마당 필터 동기화 실패", profile.getSource(), e);
            return CollectorResult.builder()
                    .source(profile.getSource())
                    .failed(failed + 1)
                    .message("동기화 실패: " + e.getMessage())
                    .build();
        }
    }
}
