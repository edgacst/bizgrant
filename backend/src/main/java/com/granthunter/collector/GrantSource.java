package com.granthunter.collector;

import java.util.Arrays;
import java.util.Optional;

/**
 * 정부 지원사업 데이터 수집 소스
 */
public enum GrantSource {
    BIZINFO("기업마당", "공공데이터 API"),
    MSS("중소벤처기업부", "HTML 스크래핑"),
    KSTARTUP("K-Startup", "HTML 스크래핑"),
    G2B("나라장터", "공공데이터 API"),
    G2B_AWARD("나라장터 낙찰", "공공데이터 API"),
    KITA("한국무역협회", "기업마당 API 필터"),
    SBA("서울경제진흥원", "기업마당 API 필터"),
    KOTRA("KOTRA", "기업마당 API 필터"),
    KISED("창업진흥원", "기업마당 API 필터"),
    KOCCA("한국콘텐츠진흥원", "기업마당 API 필터"),
    KOSME("중소기업진흥공단", "기업마당 API + HTML"),
    MANUAL("수동 등록", "관리자 입력");

    private final String label;
    private final String method;

    GrantSource(String label, String method) {
        this.label = label;
        this.method = method;
    }

    public String getLabel() {
        return label;
    }

    public String getMethod() {
        return method;
    }

    public static Optional<GrantSource> fromName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        String normalized = name.trim().toUpperCase()
                .replace("K-STARTUP", "KSTARTUP")
                .replace("BIZINFO.GO.KR", "BIZINFO")
                .replace("SMBA", "MSS")
                .replace("BIZ", "BIZINFO")
                .replace("-", "_");
        return Arrays.stream(values())
                .filter(s -> s.name().equals(normalized))
                .findFirst()
                .or(() -> Optional.ofNullable(InstitutionProfile.fromConfigName(name))
                        .map(InstitutionProfile::getSource));
    }

    public static String normalize(String raw) {
        return fromName(raw).map(Enum::name).orElse(raw != null ? raw.toUpperCase() : MANUAL.name());
    }
}
