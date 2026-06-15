package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * @deprecated {@link G2bApiCollector} 사용. 빈 등록 해제됨.
 */
@Deprecated
@RequiredArgsConstructor
public class G2bHtmlCollector implements GrantCollector {

    private final HtmlBoardCollector htmlBoardCollector;
    private final GrantSyncProperties properties;

    @Override
    public GrantSource getSource() {
        return GrantSource.G2B;
    }

    @Override
    public boolean isEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "g2b".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int maxPages = properties.getSources().stream()
                .filter(s -> "g2b".equalsIgnoreCase(s.getName()))
                .map(GrantSyncProperties.SourceConfig::getMaxPages)
                .findFirst().orElse(3);

        HtmlBoardCollector.BoardConfig config = new HtmlBoardCollector.BoardConfig(
                GrantSource.G2B,
                "https://www.g2b.go.kr",
                "/ep/preparation/prestd/prestdList.do",
                "pageIndex",
                "나라장터",
                "table tbody tr, .list_body tr",
                maxPages
        );
        return htmlBoardCollector.collect(GrantSource.G2B, config);
    }
}
