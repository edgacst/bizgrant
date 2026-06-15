package com.granthunter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @deprecated {@link GrantSyncService} 및 HTML 수집기로 대체되었습니다.
 */
@Deprecated
@Slf4j
@Service
@RequiredArgsConstructor
public class ScraperService {

    private final GrantSyncService grantSyncService;

    /**
     * 수동 실행 시 HTML 기반 소스 동기화
     */
    public void runHtmlSources() {
        grantSyncService.syncAll();
    }
}
