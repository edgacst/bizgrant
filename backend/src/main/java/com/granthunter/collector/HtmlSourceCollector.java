package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;

public class HtmlSourceCollector implements GrantCollector {

    private final HtmlBoardCollector htmlBoardCollector;
    private final GrantSyncProperties properties;
    private final GrantSource source;
    private final String configName;
    private final String defaultOrganization;

    public HtmlSourceCollector(HtmlBoardCollector htmlBoardCollector,
                               GrantSyncProperties properties,
                               GrantSource source,
                               String configName,
                               String defaultOrganization) {
        this.htmlBoardCollector = htmlBoardCollector;
        this.properties = properties;
        this.source = source;
        this.configName = configName;
        this.defaultOrganization = defaultOrganization;
    }

    @Override
    public GrantSource getSource() {
        return source;
    }

    @Override
    public boolean isEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> configName.equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        GrantSyncProperties.SourceConfig cfg = properties.getSources().stream()
                .filter(s -> configName.equalsIgnoreCase(s.getName()))
                .findFirst()
                .orElse(null);
        if (cfg == null) {
            return CollectorResult.builder()
                    .source(source)
                    .message(configName + " 설정 없음")
                    .build();
        }

        HtmlBoardCollector.BoardConfig boardConfig = new HtmlBoardCollector.BoardConfig(
                source,
                cfg.getUrl(),
                cfg.getListPath(),
                cfg.getPageParam(),
                cfg.getOrganization().isBlank() ? defaultOrganization : cfg.getOrganization(),
                cfg.getRowSelector(),
                cfg.getMaxPages()
        );
        return htmlBoardCollector.collect(source, boardConfig);
    }
}
