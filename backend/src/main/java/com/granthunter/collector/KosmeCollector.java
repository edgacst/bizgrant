package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KosmeCollector implements GrantCollector {

    private final InstitutionBizinfoSync institutionBizinfoSync;
    private final HtmlBoardCollector htmlBoardCollector;
    private final GrantSyncProperties properties;

    @Override
    public GrantSource getSource() {
        return GrantSource.KOSME;
    }

    @Override
    public boolean isEnabled() {
        return institutionBizinfoSync.isEnabled(InstitutionProfile.KOSME)
                || properties.getSources().stream()
                .anyMatch(s -> "kosme".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        CollectorResult apiResult = institutionBizinfoSync.sync(InstitutionProfile.KOSME);
        CollectorResult htmlResult = new HtmlSourceCollector(
                htmlBoardCollector,
                properties,
                GrantSource.KOSME,
                "kosme",
                InstitutionProfile.KOSME.getDefaultOrganization()
        ).collect();

        return CollectorResult.builder()
                .source(GrantSource.KOSME)
                .fetched(apiResult.getFetched() + htmlResult.getFetched())
                .created(apiResult.getCreated() + htmlResult.getCreated())
                .updated(apiResult.getUpdated() + htmlResult.getUpdated())
                .skipped(apiResult.getSkipped() + htmlResult.getSkipped())
                .failed(apiResult.getFailed() + htmlResult.getFailed())
                .message(String.format("중소기업진흥공단 API %d건 + HTML %d건",
                        apiResult.getFetched(), htmlResult.getFetched()))
                .build();
    }
}
