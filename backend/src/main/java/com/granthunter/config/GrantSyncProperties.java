package com.granthunter.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "app.grant-sync")
public class GrantSyncProperties {

    /** 자동 동기화 on/off (로컬 개발 시 false 권장) */
    private boolean enabled = true;

    /** 자동 동기화 cron (기본: 매일 08:00, 16:00) */
    private String cron = "0 0 8,16 * * *";

    /** API/스크래핑 페이지 간 대기(ms) */
    private int pageDelayMs = 500;

    /** 소스별 최대 페이지 수 (안전 제한) */
    private int maxPagesPerSource = 50;

    /** HTML 소스별 최대 상세 페이지 수 */
    private int maxDetailPages = 30;

    private PublicDataConfig publicData = new PublicDataConfig();
    private G2bConfig g2b = new G2bConfig();
    private G2bAwardConfig g2bAward = new G2bAwardConfig();
    private List<SourceConfig> sources = new ArrayList<>();

    @Data
    public static class PublicDataConfig {
        private String apiKey = "";
        private String baseUrl = "https://apis.data.go.kr/1421000/bizinfo";
        private int pageSize = 50;
    }

    @Data
    public static class G2bConfig {
        private String baseUrl = "https://apis.data.go.kr/1230000/ad/BidPublicInfoService";
        /** 동기화 시 조회할 과거 일수 */
        private int lookbackDays = 90;
        /** API 조회 기간 분할 일수 (나라장터는 장기간 단일 조회 시 오류·누락 가능) */
        private int chunkDays = 14;
        private int pageSize = 100;
    }

    @Data
    public static class G2bAwardConfig {
        private String baseUrl = "https://apis.data.go.kr/1230000/as/ScsbidInfoService";
        private int lookbackDays = 90;
        private int chunkDays = 14;
        private int pageSize = 100;
        /** 개찰일 기준 목록 노출 일수 */
        private int displayDays = 90;
    }

    @Data
    public static class SourceConfig {
        private String name;
        private String url;
        private boolean enabled = false;
        private String type = "HTML";
        private String listPath = "";
        private String pageParam = "pageIndex";
        private String organization = "";
        private String rowSelector = "table tbody tr, table.board_list tbody tr";
        private int maxPages = 10;
    }
}
