package com.granthunter.collector;

import com.granthunter.config.GrantSyncProperties;
import com.granthunter.entity.GrantNotice;
import com.granthunter.service.GrantNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BizinfoApiClient {

    private final GrantSyncProperties properties;
    private final GrantNormalizer normalizer;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public boolean isConfigured() {
        return !properties.getPublicData().getApiKey().isBlank();
    }

    public int fetchTotalCount(String searchKeyword) throws Exception {
        String xml = fetchPageXml(1, searchKeyword);
        Document doc = parseXml(xml);
        NodeList totalNodes = doc.getElementsByTagName("totalCount");
        if (totalNodes.getLength() == 0) {
            return 0;
        }
        return Integer.parseInt(totalNodes.item(0).getTextContent().trim());
    }

    public PageResult fetchPage(int pageNo, String searchKeyword) throws Exception {
        String xml = fetchPageXml(pageNo, searchKeyword);
        return parsePage(xml);
    }

    public GrantNotice mapItem(Node item, GrantSource source) {
        String pblancId = fieldText(item, "pblancId");
        if (pblancId.isEmpty()) {
            return null;
        }

        String title = fieldText(item, "pblancNm");
        String url = fieldText(item, "pblancUrl");
        String org = fieldText(item, "jrsdInsttNm");
        String execOrg = fieldText(item, "excInsttNm");
        String content = fieldText(item, "bsnsSumryCn");
        String category = normalizer.normalizeCategory(fieldText(item, "pldirSportRealmLclasCodeNm"));
        String applyPeriod = fieldText(item, "reqstBeginEndDe");
        String target = fieldText(item, "trgetNm");
        String howTo = fieldText(item, "reqstMthPapersCn");
        String requirements = normalizer.mergePlainTextWithHtmlLinks(howTo);
        String hashtags = fieldText(item, "hashtags");

        var dates = normalizer.parsePeriod(applyPeriod);
        String plainContent = normalizer.stripHtml(content);
        String organization = org.isEmpty() ? execOrg : org;

        return GrantNotice.builder()
                .source(source.name())
                .sourceId(pblancId)
                .title(normalizer.truncate(title, 500))
                .organization(organization)
                .category(category)
                .industryTags(normalizer.extractIndustryTags(title, target, hashtags))
                .applyStart(dates[0])
                .applyEnd(normalizer.resolveApplyEnd(dates[1], applyPeriod))
                .budget(normalizer.extractBudget(content))
                .content(normalizer.truncate(plainContent, 4000))
                .eligibility(target)
                .requirements(requirements)
                .url(url.isEmpty() ? "https://www.bizinfo.go.kr" : url)
                .status("ACTIVE")
                .scrapedAt(ZonedDateTime.now())
                .build();
    }

    private String fetchPageXml(int pageNo, String searchKeyword) throws Exception {
        GrantSyncProperties.PublicDataConfig cfg = properties.getPublicData();
        StringBuilder url = new StringBuilder(String.format(
                "%s/pblancBsnsService?serviceKey=%s&numOfRows=%d&pageNo=%d",
                cfg.getBaseUrl(), cfg.getApiKey(), cfg.getPageSize(), pageNo));
        if (searchKeyword != null && !searchKeyword.isBlank()) {
            url.append("&searchKeyword=")
                    .append(URLEncoder.encode(searchKeyword.trim(), StandardCharsets.UTF_8));
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url.toString()))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new IllegalStateException("HTTP " + response.statusCode());
        }
        return response.body();
    }

    private PageResult parsePage(String xml) throws Exception {
        Document doc = parseXml(xml);
        NodeList resultCodes = doc.getElementsByTagName("resultCode");
        if (resultCodes.getLength() > 0 && !"00".equals(resultCodes.item(0).getTextContent())) {
            throw new IllegalStateException(getText(doc, "resultMsg"));
        }

        PageResult result = new PageResult();
        NodeList items = doc.getElementsByTagName("item");
        result.itemCount = items.getLength();
        for (int i = 0; i < items.getLength(); i++) {
            result.items.add(items.item(i));
        }
        return result;
    }

    private Document parseXml(String xml) throws Exception {
        return DocumentBuilderFactory.newInstance()
                .newDocumentBuilder()
                .parse(new InputSource(new StringReader(xml)));
    }

    private Element element(Node parent, String tagName) {
        NodeList children = ((Element) parent).getElementsByTagName(tagName);
        return children.getLength() > 0 ? (Element) children.item(0) : null;
    }

    private String fieldText(Node parent, String tagName) {
        Element el = element(parent, tagName);
        return el != null ? el.getTextContent().trim() : "";
    }

    private String getText(Document doc, String tagName) {
        NodeList list = doc.getElementsByTagName(tagName);
        return list.getLength() > 0 ? list.item(0).getTextContent().trim() : "";
    }

    public static class PageResult {
        public int itemCount;
        public final List<Node> items = new ArrayList<>();
    }
}
