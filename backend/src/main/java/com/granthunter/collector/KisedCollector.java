package com.granthunter.collector;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KisedCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;

    @Override
    public GrantSource getSource() {
        return GrantSource.KISED;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.KISED);
    }

    @Override
    public CollectorResult collect() {
        return institutionBizinfoSync.sync(InstitutionProfile.KISED);
    }
}
