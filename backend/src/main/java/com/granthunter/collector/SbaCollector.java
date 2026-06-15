package com.granthunter.collector;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SbaCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;

    @Override
    public GrantSource getSource() {
        return GrantSource.SBA;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.SBA);
    }

    @Override
    public CollectorResult collect() {
        return institutionBizinfoSync.sync(InstitutionProfile.SBA);
    }
}
