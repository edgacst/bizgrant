package com.granthunter.collector;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * 랜딩·요금제에 표시되는 기관별 수집 프로필.
 * 기업마당 API 검색 + 주관기관명 매칭으로 해당 기관 공고를 분리 저장합니다.
 */
public enum InstitutionProfile {
    KITA(GrantSource.KITA, "kita", "한국무역협회",
            List.of("한국무역협회", "KITA"),
            List.of("한국무역협회", "KITA")),
    SBA(GrantSource.SBA, "sba", "서울경제진흥원",
            List.of("서울경제진흥원", "SBA"),
            List.of("서울경제진흥원", "SBA")),
    KOTRA(GrantSource.KOTRA, "kotra", "KOTRA",
            List.of("KOTRA", "한국무역투자진흥공단"),
            List.of("KOTRA", "무역투자진흥공단")),
    KISED(GrantSource.KISED, "kised", "창업진흥원",
            List.of("창업진흥원", "한국창업진흥원"),
            List.of("창업진흥원", "KISED", "창업진흥")),
    KOCCA(GrantSource.KOCCA, "kocca", "한국콘텐츠진흥원",
            List.of("한국콘텐츠진흥원", "KOCCA"),
            List.of("한국콘텐츠진흥원", "KOCCA", "콘텐츠진흥원")),
    KOSME(GrantSource.KOSME, "kosme", "중소기업진흥공단",
            List.of("중소기업진흥공단", "중소벤처기업진흥공단"),
            List.of("중소기업진흥공단", "중소벤처기업진흥공단", "KOSME", "KOSMES"));

    private final GrantSource source;
    private final String configName;
    private final String defaultOrganization;
    private final List<String> searchKeywords;
    private final List<String> matchPatterns;

    InstitutionProfile(GrantSource source, String configName, String defaultOrganization,
                       List<String> searchKeywords, List<String> matchPatterns) {
        this.source = source;
        this.configName = configName;
        this.defaultOrganization = defaultOrganization;
        this.searchKeywords = searchKeywords;
        this.matchPatterns = matchPatterns;
    }

    public GrantSource getSource() {
        return source;
    }

    public String getConfigName() {
        return configName;
    }

    public String getDefaultOrganization() {
        return defaultOrganization;
    }

    public List<String> getSearchKeywords() {
        return searchKeywords;
    }

    public boolean matches(String organization, String execOrganization, String title) {
        String combined = String.join(" ",
                organization != null ? organization : "",
                execOrganization != null ? execOrganization : "",
                title != null ? title : "").toLowerCase(Locale.ROOT);
        return matchPatterns.stream()
                .anyMatch(pattern -> combined.contains(pattern.toLowerCase(Locale.ROOT)));
    }

    public static boolean matchesAnyInstitution(String organization, String execOrganization, String title) {
        return Arrays.stream(values())
                .anyMatch(profile -> profile.matches(organization, execOrganization, title));
    }

    public static InstitutionProfile fromConfigName(String name) {
        if (name == null) {
            return null;
        }
        return Arrays.stream(values())
                .filter(p -> p.configName.equalsIgnoreCase(name.trim()))
                .findFirst()
                .orElse(null);
    }
}
