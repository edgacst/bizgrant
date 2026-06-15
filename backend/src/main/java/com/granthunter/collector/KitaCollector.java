package com.granthunter.collector;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KitaCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;

    @Override
    public GrantSource getSource() {
        return GrantSource.KITA;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.KITA);
    }

    @Override
    public CollectorResult collect() {
        return institutionBizinfoSync.sync(InstitutionProfile.KITA);
    }
}
