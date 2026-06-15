package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MssHtmlCollector implements GrantCollector {

    private final HtmlBoardCollector htmlBoardCollector;
    private final GrantSyncProperties properties;

    @Override
    public GrantSource getSource() {
        return GrantSource.MSS;
    }

    @Override
    public boolean isEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "mss".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int maxPages = properties.getSources().stream()
                .filter(s -> "mss".equalsIgnoreCase(s.getName()))
                .map(GrantSyncProperties.SourceConfig::getMaxPages)
                .findFirst().orElse(5);

        HtmlBoardCollector.BoardConfig config = new HtmlBoardCollector.BoardConfig(
                GrantSource.MSS,
                "https://www.mss.go.kr",
                "/site/smba/ex/bbs/List.do?cbIdx=81",
                "pageIndex",
                "중소벤처기업부",
                "table.board_list tbody tr, table tbody tr",
                maxPages
        );
        return htmlBoardCollector.collect(GrantSource.MSS, config);
    }
}
