package com.granthunter.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.service.GrantNormalizer;
import com.granthunter.service.GrantNoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 공공데이터포털 나라장터 낙찰정보서비스(as/ScsbidInfoService) 동기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class G2bAwardApiCollector implements GrantCollector {

    private static final DateTimeFormatter API_DT = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    private final GrantSyncProperties properties;
    private final GrantNormalizer normalizer;
    private final GrantNoticeService noticeService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private record AwardType(String category, String operation) {}

    private static final List<AwardType> AWARD_TYPES = List.of(
            new AwardType("용역", "getOpengResultListInfoServc"),
            new AwardType("물품", "getOpengResultListInfoThng"),
            new AwardType("공사", "getOpengResultListInfoCnstwk")
    );

    @Override
    public GrantSource getSource() {
        return GrantSource.G2B_AWARD;
    }

    @Override
    public boolean isEnabled() {
        return isSourceEnabled() && !properties.getPublicData().getApiKey().isBlank();
    }

    private boolean isSourceEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "g2b-award".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int fetched = 0, created = 0, updated = 0, skipped = 0, failed = 0;

        LocalDateTime end = LocalDateTime.now();
        GrantSyncProperties.G2bAwardConfig cfg = properties.getG2bAward();
        List<G2bSyncSupport.DateTimeRange> ranges = G2bSyncSupport.chunkRange(
                end, cfg.getLookbackDays(), cfg.getChunkDays());

        log.info("나라장터 낙찰 API 동기화 시작: {}일, {}개 기간", cfg.getLookbackDays(), ranges.size());

        for (G2bSyncSupport.DateTimeRange range : ranges) {
            String inqryBgnDt = range.start().format(API_DT);
            String inqryEndDt = range.end().format(API_DT);

            for (AwardType awardType : AWARD_TYPES) {
                try {
                    TypeSyncResult typeResult = syncAwardType(awardType, inqryBgnDt, inqryEndDt);
                    fetched += typeResult.fetched;
                    created += typeResult.created;
                    updated += typeResult.updated;
                    skipped += typeResult.skipped;
                    failed += typeResult.failed;
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    failed++;
                    log.warn("나라장터 낙찰 {} 수집 실패 ({}~{}): {}",
                            awardType.category(), inqryBgnDt, inqryEndDt, e.getMessage());
                }
            }
        }

        String message = fetched > 0
                ? String.format("나라장터 낙찰 %d건 처리 (신규 %d, 갱신 %d)", fetched, created, updated)
                : "나라장터 낙찰 0건 — API 키·활용승인 상태를 확인하세요";

        return CollectorResult.builder()
                .source(getSource())
                .fetched(fetched)
                .created(created)
                .updated(updated)
                .skipped(skipped)
                .failed(failed)
                .message(message)
                .build();
    }

    private TypeSyncResult syncAwardType(AwardType awardType, String inqryBgnDt, String inqryEndDt)
            throws Exception, InterruptedException {
        TypeSyncResult result = new TypeSyncResult();
        int totalCount = fetchTotalCount(awardType, inqryBgnDt, inqryEndDt);
        if (totalCount <= 0) {
            return result;
        }

        int pageSize = properties.getG2bAward().getPageSize();
        int totalPages = Math.min(
                (totalCount + pageSize - 1) / pageSize,
                properties.getMaxPagesPerSource());

        log.info("나라장터 낙찰 {} ({}~{}): total={}, pages={}",
                awardType.category(), inqryBgnDt, inqryEndDt, totalCount, totalPages);

        for (int page = 1; page <= totalPages; page++) {
            String json = fetchPageJson(awardType, inqryBgnDt, inqryEndDt, page);
            List<GrantNotice> notices = parsePage(json, awardType.category());
            result.fetched += notices.size();

            for (GrantNotice notice : notices) {
                try {
                    GrantNoticeService.UpsertResult upsert = noticeService.upsert(notice);
                    switch (upsert) {
                        case CREATED -> result.created++;
                        case UPDATED -> result.updated++;
                        case SKIPPED -> result.skipped++;
                    }
                } catch (Exception e) {
                    result.failed++;
                    log.debug("나라장터 낙찰 저장 실패: {}", e.getMessage());
                }
            }

            if (page < totalPages) {
                Thread.sleep(properties.getPageDelayMs());
            }
        }
        return result;
    }

    private int fetchTotalCount(AwardType awardType, String inqryBgnDt, String inqryEndDt) throws Exception {
        String json = fetchPageJson(awardType, inqryBgnDt, inqryEndDt, 1);
        JsonNode body = parseResponseBody(json);
        if (body == null) return 0;
        JsonNode totalNode = body.path("totalCount");
        return totalNode.isMissingNode() ? 0 : totalNode.asInt(0);
    }

    private String fetchPageJson(AwardType awardType, String inqryBgnDt, String inqryEndDt, int pageNo)
            throws Exception {
        GrantSyncProperties.G2bAwardConfig cfg = properties.getG2bAward();
        return requestPage(cfg.getBaseUrl(), awardType.operation(), inqryBgnDt, inqryEndDt, pageNo);
    }

    private String requestPage(String baseUrl, String operation, String inqryBgnDt, String inqryEndDt, int pageNo)
            throws Exception {
        String apiKey = properties.getPublicData().getApiKey();
        int pageSize = properties.getG2bAward().getPageSize();
        String url = String.format(
                "%s/%s?serviceKey=%s&pageNo=%d&numOfRows=%d&type=json&inqryDiv=1&inqryBgnDt=%s&inqryEndDt=%s",
                baseUrl, operation, apiKey, pageNo, pageSize, inqryBgnDt, inqryEndDt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            String hint = response.body() != null ? response.body().trim() : "";
            throw new IllegalStateException("HTTP " + response.statusCode() + ": " + hint);
        }
        return response.body();
    }

    private JsonNode parseResponseBody(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode header = root.path("response").path("header");
        String resultCode = header.path("resultCode").asText("");
        if (!resultCode.isEmpty() && !"00".equals(resultCode)) {
            throw new IllegalStateException(header.path("resultMsg").asText("API 오류"));
        }
        return root.path("response").path("body");
    }

    private List<GrantNotice> parsePage(String json, String category) throws Exception {
        JsonNode body = parseResponseBody(json);
        List<GrantNotice> notices = new ArrayList<>();
        for (JsonNode item : G2bSyncSupport.extractItemNodes(body)) {
            GrantNotice notice = mapItem(item, category);
            if (notice != null) notices.add(notice);
        }
        return notices;
    }

    private GrantNotice mapItem(JsonNode item, String category) {
        String bidNtceNo = text(item, "bidNtceNo");
        if (bidNtceNo.isEmpty()) return null;

        String bidNtceOrd = text(item, "bidNtceOrd");
        String rbidNo = text(item, "rbidNo");
        String sourceId = "award-" + bidNtceNo + "-" + bidNtceOrd
                + (rbidNo.isEmpty() ? "" : "-r" + rbidNo);

        String title = text(item, "bidNtceNm");
        String ntceInstt = text(item, "ntceInsttNm");
        String dmInstt = text(item, "dminsttNm");
        String organization = dmInstt.isEmpty() ? ntceInstt : dmInstt;
        String progress = text(item, "progrsDivCdNm");

        LocalDate opengDate = parseG2bDate(firstNonEmpty(
                text(item, "rlOpengDt"), text(item, "opengDt"), text(item, "fnlScsbidDt")));
        int displayDays = properties.getG2bAward().getDisplayDays();
        LocalDate listUntil = opengDate != null
                ? opengDate.plusDays(displayDays)
                : LocalDate.now().plusDays(displayDays);

        OpengCorpInfo corpInfo = parseOpengCorpInfo(text(item, "opengCorpInfo"));
        String winner = firstNonEmpty(corpInfo.corpName(), text(item, "fnlScsbidCorpNm"), text(item, "bidwinnrNm"));
        String awardAmount = firstNonEmpty(corpInfo.amount(), text(item, "fnlScsbidAmt"), text(item, "scsbidAmt"));
        String budget = formatPrice(awardAmount);
        String rank = firstNonEmpty(corpInfo.rank(), text(item, "opengRank"));
        String bidMethod = text(item, "bidMethdNm");

        String content = buildContent(category, ntceInstt, dmInstt, progress, opengDate, winner, rank, bidMethod);

        String url = firstNonEmpty(text(item, "bidNtceDtlUrl"), text(item, "bidNtceUrl"));
        if (url.isEmpty()) {
            url = "https://www.g2b.go.kr/ep/invitation/publish/bidInfoDtl.do?bidno=" + bidNtceNo;
        }

        return GrantNotice.builder()
                .source(GrantSource.G2B_AWARD.name())
                .sourceId(sourceId)
                .title(normalizer.truncate(title.isEmpty() ? "(제목 없음) " + bidNtceNo : title, 500))
                .organization(normalizer.truncate(organization.isEmpty() ? "조달청" : organization, 200))
                .category(category)
                .industryTags(category)
                .applyStart(opengDate)
                .applyEnd(listUntil)
                .budget(budget)
                .content(normalizer.truncate(content, 4000))
                .eligibility(winner.isEmpty() ? null : "낙찰업체: " + winner)
                .requirements(progress.isEmpty()
                        ? (rank.isEmpty() ? bidMethod : "순위: " + rank)
                        : progress + (rank.isEmpty() ? "" : " / 순위: " + rank))
                .url(url)
                .status("ACTIVE")
                .scrapedAt(ZonedDateTime.now())
                .build();
    }

    private record OpengCorpInfo(String corpName, String amount, String rank) {}

    private OpengCorpInfo parseOpengCorpInfo(String raw) {
        if (raw == null || raw.isBlank()) {
            return new OpengCorpInfo("", "", "");
        }
        String first = raw.split(";")[0].trim();
        String[] parts = first.split("\\^");
        String corpName = parts.length >= 1 ? parts[0].trim() : "";
        String amount = "";
        String rank = "";
        if (parts.length >= 3 && parts[2].replaceAll("[^0-9]", "").length() >= 4) {
            amount = parts[2].trim();
        }
        if (parts.length >= 4 && parts[3].replaceAll("[^0-9]", "").length() <= 3) {
            rank = parts[3].trim();
        }
        return new OpengCorpInfo(corpName, amount, rank);
    }

    private String buildContent(String category, String ntceInstt, String dmInstt, String progress,
                                LocalDate opengDate, String winner, String rank, String bidMethod) {
        StringBuilder sb = new StringBuilder();
        sb.append("낙찰유형: ").append(category);
        if (!progress.isEmpty()) sb.append("\n진행상태: ").append(progress);
        if (opengDate != null) sb.append("\n개찰일: ").append(opengDate);
        if (!ntceInstt.isEmpty()) sb.append("\n공고기관: ").append(ntceInstt);
        if (!dmInstt.isEmpty()) sb.append("\n수요기관: ").append(dmInstt);
        if (!winner.isEmpty()) sb.append("\n낙찰업체: ").append(winner);
        if (!rank.isEmpty()) sb.append("\n순위: ").append(rank);
        if (!bidMethod.isEmpty()) sb.append("\n입찰방식: ").append(bidMethod);
        return sb.toString();
    }

    private String firstNonEmpty(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value.trim();
        }
        return "";
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        return value.isMissingNode() || value.isNull() ? "" : value.asText("").trim();
    }

    private LocalDate parseG2bDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String digits = raw.replaceAll("[^0-9]", "");
        if (digits.length() >= 8) {
            try {
                return LocalDate.parse(digits.substring(0, 8), DateTimeFormatter.BASIC_ISO_DATE);
            } catch (Exception ignored) {
                return normalizer.parseFlexibleDate(raw);
            }
        }
        return normalizer.parseFlexibleDate(raw);
    }

    private String formatPrice(String raw) {
        if (raw == null || raw.isBlank()) return "";
        try {
            long price = Long.parseLong(raw.replaceAll("[^0-9]", ""));
            if (price <= 0) return "";
            if (price >= 100_000_000L) {
                return String.format("낙찰가격 %.1f억원", price / 100_000_000.0);
            }
            if (price >= 10_000L) {
                return String.format("낙찰가격 %,d만원", price / 10_000);
            }
            return String.format("낙찰가격 %,d원", price);
        } catch (NumberFormatException e) {
            return raw;
        }
    }

    private static class TypeSyncResult {
        int fetched;
        int created;
        int updated;
        int skipped;
        int failed;
    }
}
