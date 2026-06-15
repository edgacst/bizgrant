package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.service.GrantNormalizer;
import com.granthunter.service.GrantNoticeService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * HTML 게시판 기반 정부 지원사업 수집기 (중기부, K-Startup, 나라장터 등)
 */
@Slf4j
@Component
public class HtmlBoardCollector {

    private final GrantSyncProperties properties;
    private final GrantNormalizer normalizer;
    private final GrantNoticeService noticeService;

    public HtmlBoardCollector(GrantSyncProperties properties,
                              GrantNormalizer normalizer,
                              GrantNoticeService noticeService) {
        this.properties = properties;
        this.normalizer = normalizer;
        this.noticeService = noticeService;
    }

    public CollectorResult collect(GrantSource source, BoardConfig config) {
        if (!isEnabled(source)) {
            return CollectorResult.builder()
                    .source(source)
                    .message(source.getLabel() + " 비활성화")
                    .build();
        }

        int fetched = 0, created = 0, updated = 0, skipped = 0, failed = 0;
        Set<String> seen = new LinkedHashSet<>();
        List<BoardLink> links = new ArrayList<>();

        try {
            int maxPages = Math.min(config.maxPages, properties.getMaxPagesPerSource());
            for (int page = 1; page <= maxPages; page++) {
                String listUrl = config.buildListUrl(page);
                Document listDoc = fetch(listUrl);
                List<BoardLink> pageLinks = extractLinks(listDoc, config, seen);
                if (pageLinks.isEmpty()) break;
                links.addAll(pageLinks);
                if (page < maxPages) sleep();
            }

            int detailLimit = Math.min(links.size(), properties.getMaxDetailPages());
            for (int i = 0; i < detailLimit; i++) {
                BoardLink link = links.get(i);
                try {
                    GrantNotice notice = fetchDetail(link, config);
                    if (notice == null) {
                        skipped++;
                        continue;
                    }
                    fetched++;
                    GrantNoticeService.UpsertResult result = noticeService.upsert(notice);
                    switch (result) {
                        case CREATED -> created++;
                        case UPDATED -> updated++;
                        case SKIPPED -> skipped++;
                    }
                    sleep();
                } catch (Exception e) {
                    failed++;
                    log.debug("{} 상세 수집 실패 ({}): {}", source, link.url, e.getMessage());
                }
            }

            return CollectorResult.builder()
                    .source(source)
                    .fetched(fetched)
                    .created(created)
                    .updated(updated)
                    .skipped(skipped)
                    .failed(failed)
                    .message(String.format("%s %d건 처리 (신규 %d, 갱신 %d)", source.getLabel(), fetched, created, updated))
                    .build();
        } catch (Exception e) {
            log.error("{} HTML 수집 실패", source.getLabel(), e);
            return CollectorResult.builder()
                    .source(source)
                    .failed(1)
                    .message("수집 실패: " + e.getMessage())
                    .build();
        }
    }

    private boolean isEnabled(GrantSource source) {
        return properties.getSources().stream()
                .anyMatch(s -> source.name().equalsIgnoreCase(s.getName()) && s.isEnabled());
    }

    private Document fetch(String url) throws Exception {
        return Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36")
                .header("Accept-Language", "ko-KR,ko;q=0.9")
                .timeout(30000)
                .get();
    }

    private List<BoardLink> extractLinks(Document doc, BoardConfig config, Set<String> seen) {
        List<BoardLink> links = new ArrayList<>();
        Elements rows = doc.select(config.rowSelector);
        if (rows.isEmpty()) {
            rows = doc.select("table tbody tr, .board_list li, .bbs_list li");
        }

        for (Element row : rows) {
            Element anchor = row.selectFirst("a[href]");
            if (anchor == null) continue;

            String title = anchor.text().trim();
            String href = anchor.attr("abs:href");
            if (title.length() < 8 || href.isBlank()) continue;
            if (href.contains("javascript:") || href.contains("List.do")) continue;
            if (seen.contains(href)) continue;
            seen.add(href);

            String sourceId = config.extractSourceId(href);
            links.add(new BoardLink(title, href, sourceId));
        }
        return links;
    }

    private GrantNotice fetchDetail(BoardLink link, BoardConfig config) throws Exception {
        Document doc = fetch(link.url);
        String title = firstText(doc, "h1", "h2", ".subject", ".view_title", ".tit");
        if (title.isBlank()) title = link.title;

        String periodText = extractField(doc, "접수기간", "신청기간", "공고기간", "모집기간");
        LocalDate[] dates = normalizer.parsePeriod(periodText);
        String content = doc.body() != null ? doc.body().text() : "";
        String attachmentLinks = extractAttachmentLinks(doc);
        String requirements = extractField(doc, "제출서류", "필요서류", "신청방법");
        if (!attachmentLinks.isBlank()) {
            requirements = requirements.isBlank()
                    ? attachmentLinks
                    : requirements + "\n" + attachmentLinks;
        }
        String category = normalizer.normalizeCategory(
                extractField(doc, "지원분야", "사업분류", "분야") + " " + title);

        return GrantNotice.builder()
                .source(config.source.name())
                .sourceId(link.sourceId)
                .title(normalizer.truncate(title, 500))
                .organization(config.defaultOrganization)
                .category(category)
                .industryTags(normalizer.extractIndustryTags(title, extractField(doc, "지원대상", "신청자격"), category))
                .applyStart(dates[0])
                .applyEnd(normalizer.resolveApplyEnd(dates[1], periodText))
                .budget(extractField(doc, "지원규모", "지원금액", "사업예산"))
                .content(normalizer.truncate(content, 4000))
                .eligibility(extractField(doc, "지원대상", "신청자격", "참여대상"))
                .requirements(requirements)
                .url(link.url)
                .status("ACTIVE")
                .scrapedAt(ZonedDateTime.now())
                .build();
    }

    private String firstText(Document doc, String... selectors) {
        for (String sel : selectors) {
            Element el = doc.selectFirst(sel);
            if (el != null && !el.text().isBlank()) return el.text().trim();
        }
        return "";
    }

    private String extractField(Document doc, String... labels) {
        for (String label : labels) {
            Elements ths = doc.select("th:contains(" + label + ")");
            for (Element th : ths) {
                Element td = th.nextElementSibling();
                if (td != null && "td".equals(td.tagName()) && !td.text().isBlank()) {
                    return td.text().trim();
                }
            }
            Elements dts = doc.select("dt:contains(" + label + ")");
            for (Element dt : dts) {
                Element dd = dt.nextElementSibling();
                if (dd != null && "dd".equals(dd.tagName()) && !dd.text().isBlank()) {
                    return dd.text().trim();
                }
            }
        }
        return "";
    }

    private void sleep() throws InterruptedException {
        Thread.sleep(properties.getPageDelayMs());
    }

    private String extractAttachmentLinks(Document doc) {
        LinkedHashSet<String> urls = new LinkedHashSet<>();
        Pattern filePattern = Pattern.compile("\\.(hwp|hwpx|docx?|pdf|zip|xlsx?)(?:\\?|$)", Pattern.CASE_INSENSITIVE);

        for (Element anchor : doc.select("a[href]")) {
            String href = anchor.attr("abs:href");
            if (href.isBlank() || href.contains("javascript:")) {
                continue;
            }
            String text = anchor.text().trim();
            boolean looksLikeAttachment = filePattern.matcher(href).find()
                    || text.contains("다운로드")
                    || text.contains("내려받기")
                    || text.contains("첨부");
            if (looksLikeAttachment && href.startsWith("http")) {
                urls.add(href);
            }
        }
        return String.join("\n", urls);
    }

    public record BoardLink(String title, String url, String sourceId) {}

    public static class BoardConfig {
        public final GrantSource source;
        public final String baseUrl;
        public final String listPath;
        public final String pageParam;
        public final String defaultOrganization;
        public final String rowSelector;
        public final int maxPages;

        public BoardConfig(GrantSource source, String baseUrl, String listPath,
                           String pageParam, String defaultOrganization,
                           String rowSelector, int maxPages) {
            this.source = source;
            this.baseUrl = baseUrl;
            this.listPath = listPath;
            this.pageParam = pageParam;
            this.defaultOrganization = defaultOrganization;
            this.rowSelector = rowSelector;
            this.maxPages = maxPages;
        }

        public String buildListUrl(int page) {
            String sep = listPath.contains("?") ? "&" : "?";
            return baseUrl + listPath + sep + pageParam + "=" + page;
        }

        public String extractSourceId(String href) {
            Matcher m = Pattern.compile("[?&](?:seq|id|no|cbIdx|nttId)=(\\d+)").matcher(href);
            if (m.find()) {
                return source.name().toLowerCase() + "-" + m.group(1);
            }
            return source.name().toLowerCase() + "-" + Math.abs(href.hashCode());
        }
    }
}
