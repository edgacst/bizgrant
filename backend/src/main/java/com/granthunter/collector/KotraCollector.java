package com.granthunter.collector;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KotraCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;

    @Override
    public GrantSource getSource() {
        return GrantSource.KOTRA;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.KOTRA);
    }

    @Override
    public CollectorResult collect() {
        return institutionBizinfoSync.sync(InstitutionProfile.KOTRA);
    }
}
