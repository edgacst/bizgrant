package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.service.GrantNoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.w3c.dom.Node;

/**
 * 공공데이터포털 기업마당 API 전체 동기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BizinfoApiCollector implements GrantCollector {

    private final GrantSyncProperties properties;
    private final BizinfoApiClient bizinfoApiClient;
    private final GrantNoticeService noticeService;

    @Override
    public GrantSource getSource() {
        return GrantSource.BIZINFO;
    }

    @Override
    public boolean isEnabled() {
        return isSourceEnabled() && bizinfoApiClient.isConfigured();
    }

    private boolean isSourceEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "bizinfo".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int fetched = 0;
        int created = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;

        try {
            int totalCount = bizinfoApiClient.fetchTotalCount(null);
            if (totalCount <= 0) {
                return CollectorResult.builder()
                        .source(getSource())
                        .message("API 응답 없음")
                        .build();
            }

            int pageSize = properties.getPublicData().getPageSize();
            int totalPages = Math.min(
                    (totalCount + pageSize - 1) / pageSize,
                    properties.getMaxPagesPerSource());

            log.info("기업마당 API 동기화 시작: total={}, pages={}", totalCount, totalPages);

            for (int page = 1; page <= totalPages; page++) {
                try {
                    BizinfoApiClient.PageResult pageResult = bizinfoApiClient.fetchPage(page, null);
                    fetched += pageResult.itemCount;

                    for (Node item : pageResult.items) {
                        try {
                            GrantNotice notice = bizinfoApiClient.mapItem(item, GrantSource.BIZINFO);
                            if (notice == null) {
                                continue;
                            }
                            if (InstitutionProfile.matchesAnyInstitution(
                                    notice.getOrganization(), "", notice.getTitle())) {
                                skipped++;
                                continue;
                            }
                            switch (noticeService.upsert(notice)) {
                                case CREATED -> created++;
                                case UPDATED -> updated++;
                                case SKIPPED -> skipped++;
                            }
                        } catch (Exception e) {
                            failed++;
                            log.debug("기업마당 저장 실패: {}", e.getMessage());
                        }
                    }

                    if (page < totalPages) {
                        Thread.sleep(properties.getPageDelayMs());
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    failed++;
                    log.warn("기업마당 페이지 {} 수집 실패: {}", page, e.getMessage());
                }
            }

            return CollectorResult.builder()
                    .source(getSource())
                    .fetched(fetched)
                    .created(created)
                    .updated(updated)
                    .skipped(skipped)
                    .failed(failed)
                    .message(String.format("기업마당 %d건 처리 (신규 %d, 갱신 %d)", fetched, created, updated))
                    .build();
        } catch (Exception e) {
            log.error("기업마당 API 동기화 실패", e);
            return CollectorResult.builder()
                    .source(getSource())
                    .failed(1)
                    .message("동기화 실패: " + e.getMessage())
                    .build();
        }
    }
}
