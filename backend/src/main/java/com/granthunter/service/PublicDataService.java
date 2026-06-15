package com.granthunter.service;

import com.granthunter.collector.GrantSource;
import com.granthunter.entity.GrantNotice;
import com.granthunter.repository.GrantNoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.Optional;

/**
 * @deprecated {@link com.granthunter.service.GrantSyncService} 및 {@link com.granthunter.collector.BizinfoApiCollector} 사용
 */
@Deprecated
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicDataService {

    private final GrantSyncService grantSyncService;

    public int fetchAndSave() {
        var result = grantSyncService.syncSource(GrantSource.BIZINFO.name());
        Object created = result.get("totalCreated");
        return created instanceof Number n ? n.intValue() : 0;
    }
}
