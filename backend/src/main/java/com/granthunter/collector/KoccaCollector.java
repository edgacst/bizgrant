package com.granthunter.collector;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KoccaCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;

    @Override
    public GrantSource getSource() {
        return GrantSource.KOCCA;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.KOCCA);
    }

    @Override
    public CollectorResult collect() {
        return institutionBizinfoSync.sync(InstitutionProfile.KOCCA);
    }
}
