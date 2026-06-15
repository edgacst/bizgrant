package com.granthunter.service;

import com.granthunter.collector.InstitutionProfile;
import com.granthunter.entity.GrantNotice;
import com.granthunter.repository.GrantNoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class InstitutionReclassificationService {

    private final GrantNoticeRepository noticeRepository;

    @Transactional
    public Map<String, Object> reclassifyActiveBizinfo() {
        LocalDate today = LocalDate.now();
        List<GrantNotice> candidates = noticeRepository.findActiveBySource("BIZINFO", today);

        int moved = 0;
        int deletedDuplicates = 0;
        int skipped = 0;
        Map<String, Integer> byTarget = new LinkedHashMap<>();

        for (GrantNotice notice : candidates) {
            InstitutionProfile profile = matchProfile(notice);
            if (profile == null) {
                skipped++;
                continue;
            }

            String targetSource = profile.getSource().name();
            Optional<GrantNotice> existing = noticeRepository.findBySourceAndSourceId(
                    targetSource, notice.getSourceId());

            if (existing.isPresent() && !existing.get().getId().equals(notice.getId())) {
                noticeRepository.delete(notice);
                deletedDuplicates++;
                byTarget.merge(targetSource, 1, Integer::sum);
                continue;
            }

            notice.setSource(targetSource);
            if (notice.getOrganization() == null || notice.getOrganization().isBlank()) {
                notice.setOrganization(profile.getDefaultOrganization());
            }
            noticeRepository.save(notice);
            moved++;
            byTarget.merge(targetSource, 1, Integer::sum);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "success");
        result.put("scanned", candidates.size());
        result.put("moved", moved);
        result.put("deletedDuplicates", deletedDuplicates);
        result.put("skipped", skipped);
        result.put("byTarget", byTarget);
        result.put("activeTotal", noticeRepository.countActiveNotices(today));
        result.put("bySource", noticeRepository.countActiveBySource(today));
        return result;
    }

    private InstitutionProfile matchProfile(GrantNotice notice) {
        for (InstitutionProfile profile : InstitutionProfile.values()) {
            if (profile.matches(notice.getOrganization(), "", notice.getTitle())) {
                return profile;
            }
        }
        return null;
    }
}
