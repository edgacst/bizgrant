package com.granthunter.service;

import com.granthunter.collector.GrantSource;
import com.granthunter.entity.GrantNotice;
import com.granthunter.repository.GrantNoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GrantNoticeService {

    public enum UpsertResult { CREATED, UPDATED, SKIPPED }

    private final GrantNoticeRepository noticeRepository;
    private final GrantNormalizer normalizer;

    @Transactional
    public UpsertResult upsert(GrantNotice incoming) {
        String source = GrantSource.normalize(incoming.getSource());
        incoming.setSource(source);

        if (incoming.getApplyEnd() == null) {
            incoming.setApplyEnd(GrantNormalizer.ONGOING_END);
        }
        if (incoming.getStatus() == null || incoming.getStatus().isBlank()) {
            incoming.setStatus("ACTIVE");
        } else {
            incoming.setStatus(incoming.getStatus().toUpperCase());
        }
        if (incoming.getUrl() == null || incoming.getUrl().isBlank()) {
            incoming.setUrl("https://www.bizinfo.go.kr");
        }

        Optional<GrantNotice> existing = noticeRepository.findBySourceAndSourceId(source, incoming.getSourceId());
        if (existing.isEmpty()) {
            incoming.setScrapedAt(ZonedDateTime.now());
            noticeRepository.save(incoming);
            return UpsertResult.CREATED;
        }

        GrantNotice current = existing.get();
        boolean changed = applyUpdates(current, incoming);
        current.setScrapedAt(ZonedDateTime.now());
        noticeRepository.save(current);
        return changed ? UpsertResult.UPDATED : UpsertResult.SKIPPED;
    }

    private boolean applyUpdates(GrantNotice current, GrantNotice incoming) {
        boolean changed = false;
        changed |= updateIfDifferent(current::setTitle, current.getTitle(), incoming.getTitle());
        changed |= updateIfDifferent(current::setOrganization, current.getOrganization(), incoming.getOrganization());
        changed |= updateIfDifferent(current::setCategory, current.getCategory(), incoming.getCategory());
        changed |= updateIfDifferent(current::setIndustryTags, current.getIndustryTags(), incoming.getIndustryTags());
        changed |= updateIfDifferent(current::setApplyStart, current.getApplyStart(), incoming.getApplyStart());
        changed |= updateIfDifferent(current::setApplyEnd, current.getApplyEnd(), incoming.getApplyEnd());
        changed |= updateIfDifferent(current::setBudget, current.getBudget(), incoming.getBudget());
        changed |= updateIfDifferent(current::setContent, current.getContent(), incoming.getContent());
        changed |= updateIfDifferent(current::setEligibility, current.getEligibility(), incoming.getEligibility());
        changed |= updateIfDifferent(current::setRequirements, current.getRequirements(), incoming.getRequirements());
        changed |= updateIfDifferent(current::setUrl, current.getUrl(), incoming.getUrl());
        changed |= updateIfDifferent(current::setStatus, current.getStatus(), incoming.getStatus());
        return changed;
    }

    private <T> boolean updateIfDifferent(java.util.function.Consumer<T> setter, T current, T incoming) {
        if (incoming == null) return false;
        if (incoming instanceof String s && s.isBlank()) return false;
        if (incoming.equals(current)) return false;
        setter.accept(incoming);
        return true;
    }
}
