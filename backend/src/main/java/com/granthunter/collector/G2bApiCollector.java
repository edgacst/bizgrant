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
 * 공공데이터포털 나라장터 입찰공고정보서비스(ad/BidPublicInfoService) 동기화
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class G2bApiCollector implements GrantCollector {

    private static final DateTimeFormatter API_DT = DateTimeFormatter.ofPattern("yyyyMMddHHmm");

    private final GrantSyncProperties properties;
    private final GrantNormalizer normalizer;
    private final GrantNoticeService noticeService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private record BidType(String category, String operation) {}

    private static final List<BidType> BID_TYPES = List.of(
            new BidType("용역", "getBidPblancListInfoServc"),
            new BidType("물품", "getBidPblancListInfoThng"),
            new BidType("공사", "getBidPblancListInfoCnstwk")
    );

    @Override
    public GrantSource getSource() {
        return GrantSource.G2B;
    }

    @Override
    public boolean isEnabled() {
        return isSourceEnabled() && !properties.getPublicData().getApiKey().isBlank();
    }

    private boolean isSourceEnabled() {
        return properties.getSources().stream()
                .anyMatch(s -> "g2b".equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    @Override
    public CollectorResult collect() {
        int fetched = 0, created = 0, updated = 0, skipped = 0, failed = 0;

        LocalDateTime end = LocalDateTime.now();
        GrantSyncProperties.G2bConfig cfg = properties.getG2b();
        List<G2bSyncSupport.DateTimeRange> ranges = G2bSyncSupport.chunkRange(
                end, cfg.getLookbackDays(), cfg.getChunkDays());

        log.info("나라장터 API 동기화 시작: {}일, {}개 기간", cfg.getLookbackDays(), ranges.size());

        for (G2bSyncSupport.DateTimeRange range : ranges) {
            String inqryBgnDt = range.start().format(API_DT);
            String inqryEndDt = range.end().format(API_DT);
            log.debug("나라장터 기간: {} ~ {}", inqryBgnDt, inqryEndDt);

            for (BidType bidType : BID_TYPES) {
                try {
                    TypeSyncResult typeResult = syncBidType(bidType, inqryBgnDt, inqryEndDt);
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
                    log.warn("나라장터 {} 수집 실패 ({}~{}): {}", bidType.category(), inqryBgnDt, inqryEndDt, e.getMessage());
                }
            }
        }

        return CollectorResult.builder()
                .source(getSource())
                .fetched(fetched)
                .created(created)
                .updated(updated)
                .skipped(skipped)
                .failed(failed)
                .message(String.format("나라장터 %d건 처리 (신규 %d, 갱신 %d)", fetched, created, updated))
                .build();
    }

    private TypeSyncResult syncBidType(BidType bidType, String inqryBgnDt, String inqryEndDt)
            throws Exception, InterruptedException {
        TypeSyncResult result = new TypeSyncResult();
        int totalCount = fetchTotalCount(bidType, inqryBgnDt, inqryEndDt);
        if (totalCount <= 0) {
            log.info("나라장터 {}: 조회 결과 없음", bidType.category());
            return result;
        }

        int pageSize = properties.getG2b().getPageSize();
        int totalPages = Math.min(
                (totalCount + pageSize - 1) / pageSize,
                properties.getMaxPagesPerSource());

        log.info("나라장터 {}: total={}, pages={}", bidType.category(), totalCount, totalPages);

        for (int page = 1; page <= totalPages; page++) {
            String json = fetchPageJson(bidType, inqryBgnDt, inqryEndDt, page);
            List<GrantNotice> notices = parsePage(json, bidType.category());
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
                    log.debug("나라장터 저장 실패: {}", e.getMessage());
                }
            }

            if (page < totalPages) {
                Thread.sleep(properties.getPageDelayMs());
            }
        }
        return result;
    }

    private int fetchTotalCount(BidType bidType, String inqryBgnDt, String inqryEndDt) throws Exception {
        String json = fetchPageJson(bidType, inqryBgnDt, inqryEndDt, 1);
        JsonNode body = parseResponseBody(json);
        if (body == null) return 0;
        JsonNode totalNode = body.path("totalCount");
        return totalNode.isMissingNode() ? 0 : totalNode.asInt(0);
    }

    private String fetchPageJson(BidType bidType, String inqryBgnDt, String inqryEndDt, int pageNo)
            throws Exception {
        GrantSyncProperties.G2bConfig cfg = properties.getG2b();
        String apiKey = properties.getPublicData().getApiKey();
        String url = String.format(
                "%s/%s?serviceKey=%s&pageNo=%d&numOfRows=%d&type=json&inqryDiv=1&inqryBgnDt=%s&inqryEndDt=%s",
                cfg.getBaseUrl(),
                bidType.operation(),
                apiKey,
                pageNo,
                cfg.getPageSize(),
                inqryBgnDt,
                inqryEndDt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            String hint = response.body() != null && !response.body().isBlank()
                    ? response.body().trim()
                    : "no body";
            if (response.statusCode() == 500 && hint.contains("Unexpected")) {
                throw new IllegalStateException(
                        "HTTP 500 — 공공데이터포털에서 '나라장터 입찰공고정보서비스' 활용신청이 필요합니다");
            }
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
        String sourceId = bidNtceOrd.isEmpty() ? bidNtceNo : bidNtceNo + "-" + bidNtceOrd;

        String title = text(item, "bidNtceNm");
        String ntceInstt = text(item, "ntceInsttNm");
        String dmInstt = text(item, "dminsttNm");
        String organization = dmInstt.isEmpty() ? ntceInstt : dmInstt;

        LocalDate applyStart = parseG2bDate(text(item, "bidNtceDt"));
        LocalDate applyEnd = parseG2bDate(text(item, "bidClseDt"));
        if (applyEnd == null) {
            applyEnd = GrantNormalizer.ONGOING_END;
        }

        String presmptPrce = text(item, "presmptPrce");
        if (presmptPrce.isEmpty()) {
            presmptPrce = text(item, "asignBdgtAmt");
        }
        String budget = formatPrice(presmptPrce);

        String contractMethod = text(item, "cntrctCnclsMthdNm");
        String bidMethod = text(item, "bidMethdNm");
        String content = buildContent(category, ntceInstt, dmInstt, contractMethod, bidMethod);

        String url = text(item, "bidNtceDtlUrl");
        if (url.isEmpty()) {
            url = text(item, "bidNtceUrl");
        }
        if (url.isEmpty()) {
            url = "https://www.g2b.go.kr/ep/invitation/publish/bidInfoDtl.do?bidno=" + bidNtceNo;
        }

        return GrantNotice.builder()
                .source(GrantSource.G2B.name())
                .sourceId(sourceId)
                .title(normalizer.truncate(title, 500))
                .organization(normalizer.truncate(organization.isEmpty() ? "조달청" : organization, 200))
                .category(category)
                .industryTags(category)
                .applyStart(applyStart)
                .applyEnd(applyEnd)
                .budget(budget)
                .content(normalizer.truncate(content, 4000))
                .eligibility(contractMethod)
                .requirements(bidMethod)
                .url(url)
                .status("ACTIVE")
                .scrapedAt(ZonedDateTime.now())
                .build();
    }

    private String buildContent(String category, String ntceInstt, String dmInstt,
                                String contractMethod, String bidMethod) {
        StringBuilder sb = new StringBuilder();
        sb.append("입찰유형: ").append(category);
        if (!ntceInstt.isEmpty()) sb.append("\n공고기관: ").append(ntceInstt);
        if (!dmInstt.isEmpty()) sb.append("\n수요기관: ").append(dmInstt);
        if (!contractMethod.isEmpty()) sb.append("\n계약방법: ").append(contractMethod);
        if (!bidMethod.isEmpty()) sb.append("\n입찰방식: ").append(bidMethod);
        return sb.toString();
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
                return String.format("추정가격 %.1f억원", price / 100_000_000.0);
            }
            if (price >= 10_000L) {
                return String.format("추정가격 %,d만원", price / 10_000);
            }
            return String.format("추정가격 %,d원", price);
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
