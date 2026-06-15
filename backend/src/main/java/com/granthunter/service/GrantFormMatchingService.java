package com.granthunter.service;

import com.granthunter.dto.GrantDocumentItemDto;
import com.granthunter.dto.OfficialFormEntryDto;
import com.granthunter.entity.GrantNotice;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GrantFormMatchingService {

    private static final Set<String> ISSUANCE_TYPES = Set.of("TAX", "INSURANCE", "CERTIFICATE");
    private static final Set<String> BLOCKED_URL_FRAGMENTS = Set.of(
            "biz-download.do",
            "bizSrhResult.do",
            "4insure.or.kr"
    );

    private static final Pattern URL_PATTERN = Pattern.compile(
            "https?://[^\\s<>\"']+(?:\\.(?:hwp|hwpx|docx?|pdf|zip|xlsx?))?",
            Pattern.CASE_INSENSITIVE);
    private static final Pattern FILE_URL_PATTERN = Pattern.compile(
            "https?://[^\\s<>\"']+\\.(?:hwp|hwpx|docx?|pdf|zip|xlsx?)",
            Pattern.CASE_INSENSITIVE);

    private final OfficialFormCatalogService officialFormCatalogService;

    public List<GrantDocumentItemDto> enrichItems(GrantNotice grant, List<GrantDocumentItemDto> items) {
        List<String> extractedUrls = extractAttachmentUrls(grant);
        List<GrantDocumentItemDto> enriched = new ArrayList<>();

        for (GrantDocumentItemDto item : items) {
            OfficialFormEntryDto match = officialFormCatalogService.findBestMatch(
                    grant.getSource(),
                    grant.getCategory(),
                    item.getType());

            String directUrl = findDirectUrlForLabel(item.getLabel(), extractedUrls);
            String officialUrl = resolveOfficialUrl(item.getType(), directUrl, match, grant);
            String hwpUrl = resolveHwpUrl(item.getType(), match, grant, directUrl);
            String linkLabel = resolveLinkLabel(directUrl, item.getType());

            enriched.add(GrantDocumentItemDto.builder()
                    .key(item.getKey())
                    .label(item.getLabel())
                    .type(item.getType())
                    .required(item.isRequired())
                    .templateCode(match != null ? match.getCode() : item.getTemplateCode())
                    .officialFormUrl(officialUrl)
                    .hwpOfficialUrl(hwpUrl)
                    .officialLinkLabel(linkLabel)
                    .officialSource(match != null ? match.getSourceLabel() : null)
                    .matchedTemplateName(match != null ? match.getName() : null)
                    .attachmentUrls(filterUrlsForLabel(item.getLabel(), extractedUrls))
                    .build());
        }

        return enriched;
    }

    public List<OfficialFormEntryDto> recommendedForms(GrantNotice grant) {
        return officialFormCatalogService.findForGrant(grant.getSource(), grant.getCategory()).stream()
                .map(entry -> enrichRecommendedEntry(entry, grant))
                .toList();
    }

    public List<String> extractAttachmentUrls(GrantNotice grant) {
        LinkedHashSet<String> urls = new LinkedHashSet<>();
        collectUrls(grant.getRequirements(), urls);
        collectUrls(grant.getContent(), urls);
        return urls.stream()
                .filter(url -> grant.getUrl() == null || !url.equals(grant.getUrl()))
                .toList();
    }

    private OfficialFormEntryDto enrichRecommendedEntry(OfficialFormEntryDto entry, GrantNotice grant) {
        OfficialFormEntryDto enriched = copyEntry(entry);
        boolean issuance = isIssuanceType(entry.getDocumentTypes());

        if (!issuance && grant.getUrl() != null && !grant.getUrl().isBlank()) {
            enriched.setOfficialUrl(grant.getUrl());
            enriched.setHwpOfficialUrl(grant.getUrl());
            enriched.setName(entry.getName() + " (공고 원문)");
        } else {
            enriched.setOfficialUrl(sanitizeUrl(entry.getOfficialUrl()));
            enriched.setHwpOfficialUrl(sanitizeUrl(entry.getHwpOfficialUrl()));
        }
        return enriched;
    }

    private OfficialFormEntryDto copyEntry(OfficialFormEntryDto entry) {
        OfficialFormEntryDto copy = new OfficialFormEntryDto();
        copy.setCode(entry.getCode());
        copy.setName(entry.getName());
        copy.setSourceLabel(entry.getSourceLabel());
        copy.setSources(entry.getSources());
        copy.setDocumentTypes(entry.getDocumentTypes());
        copy.setCategories(entry.getCategories());
        copy.setOfficialUrl(entry.getOfficialUrl());
        copy.setHwpOfficialUrl(entry.getHwpOfficialUrl());
        copy.setDocxVariant(entry.getDocxVariant());
        return copy;
    }

    private String resolveOfficialUrl(String documentType, String directUrl,
                                      OfficialFormEntryDto match, GrantNotice grant) {
        if (directUrl != null) {
            return directUrl;
        }
        if (isIssuanceType(documentType) && match != null) {
            String catalogUrl = sanitizeUrl(match.getOfficialUrl());
            if (catalogUrl != null) {
                return catalogUrl;
            }
        }
        if (grant.getUrl() != null && !grant.getUrl().isBlank()) {
            return grant.getUrl();
        }
        if (match != null) {
            return sanitizeUrl(match.getOfficialUrl());
        }
        return null;
    }

    private String resolveHwpUrl(String documentType, OfficialFormEntryDto match,
                                 GrantNotice grant, String directUrl) {
        if (directUrl != null) {
            return directUrl;
        }
        if (isIssuanceType(documentType) && match != null) {
            String catalogUrl = sanitizeUrl(match.getHwpOfficialUrl());
            if (catalogUrl != null) {
                return catalogUrl;
            }
        }
        if (grant.getUrl() != null && !grant.getUrl().isBlank()) {
            return grant.getUrl();
        }
        if (match != null) {
            return sanitizeUrl(match.getHwpOfficialUrl());
        }
        return null;
    }

    private String resolveLinkLabel(String directUrl, String documentType) {
        if (directUrl != null) {
            return "첨부 양식";
        }
        if (isIssuanceType(documentType)) {
            return "발급 안내";
        }
        return "공고 원문";
    }

    private boolean isIssuanceType(String documentType) {
        return documentType != null && ISSUANCE_TYPES.contains(documentType.toUpperCase(Locale.ROOT));
    }

    private boolean isIssuanceType(List<String> documentTypes) {
        if (documentTypes == null) {
            return false;
        }
        return documentTypes.stream().anyMatch(this::isIssuanceType);
    }

    private String sanitizeUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        for (String blocked : BLOCKED_URL_FRAGMENTS) {
            if (url.contains(blocked)) {
                return null;
            }
        }
        return url;
    }

    private void collectUrls(String text, LinkedHashSet<String> urls) {
        if (text == null || text.isBlank()) {
            return;
        }
        Matcher matcher = URL_PATTERN.matcher(text);
        while (matcher.find()) {
            String url = trimTrailingPunctuation(matcher.group());
            if (sanitizeUrl(url) != null || !containsBlockedFragment(url)) {
                urls.add(url);
            }
        }
    }

    private boolean containsBlockedFragment(String url) {
        for (String blocked : BLOCKED_URL_FRAGMENTS) {
            if (url.contains(blocked)) {
                return true;
            }
        }
        return false;
    }

    private List<String> filterUrlsForLabel(String label, List<String> urls) {
        if (label == null || urls.isEmpty()) {
            return List.of();
        }
        String lower = label.toLowerCase(Locale.ROOT);
        return urls.stream()
                .filter(url -> {
                    String file = url.toLowerCase(Locale.ROOT);
                    if (lower.contains("사업계획")) {
                        return file.contains("plan") || file.contains("사업") || file.endsWith(".hwp") || file.endsWith(".docx");
                    }
                    if (lower.contains("재무")) {
                        return file.contains("finance") || file.contains("재무") || file.endsWith(".xlsx") || file.endsWith(".xls");
                    }
                    if (lower.contains("신청")) {
                        return file.contains("apply") || file.contains("신청") || file.endsWith(".hwp") || file.endsWith(".docx");
                    }
                    return FILE_URL_PATTERN.matcher(url).find();
                })
                .limit(3)
                .toList();
    }

    private String findDirectUrlForLabel(String label, List<String> urls) {
        List<String> matched = filterUrlsForLabel(label, urls);
        return matched.isEmpty() ? null : matched.get(0);
    }

    private String trimTrailingPunctuation(String url) {
        return url.replaceAll("[),.;]+$", "");
    }
}
