package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KstartupHtmlCollector implements GrantCollector {

    private final HtmlBoardCollector htmlBoardCollector;
    private final GrantSyncProperties properties;

    @Override
    public GrantSource getSource() {
        return GrantSource.KSTARTUP;
    }

    @Override
    public boolean isEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "kstartup".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int maxPages = properties.getSources().stream()
                .filter(s -> "kstartup".equalsIgnoreCase(s.getName()))
                .map(GrantSyncProperties.SourceConfig::getMaxPages)
                .findFirst().orElse(5);

        HtmlBoardCollector.BoardConfig config = new HtmlBoardCollector.BoardConfig(
                GrantSource.KSTARTUP,
                "https://www.k-startup.go.kr",
                "/web/contents/bizpbanc-ongoing.do",
                "page",
                "K-Startup",
                ".board_list tbody tr, table tbody tr, ul.list li",
                maxPages
        );
        return htmlBoardCollector.collect(GrantSource.KSTARTUP, config);
    }
}
