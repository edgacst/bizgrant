package com.granthunter.service;

import com.granthunter.dto.GrantDocumentItemDto;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class RequirementsParserService {

    private static final Pattern SPLIT_PATTERN = Pattern.compile("[\\n\\r]+|(?<=\\.)\\s+");
    private static final Pattern BULLET_PREFIX = Pattern.compile("^[·•\\-*\\d.\\)\\]]+\\s*");

    private static final List<GrantDocumentItemDto> DEFAULT_ITEMS = List.of(
            item("biz", "사업자등록증", "CERTIFICATE", true),
            item("plan", "사업계획서", "BUSINESS_PLAN", true),
            item("finance", "재무제표 (최근 2년)", "FINANCIAL", true),
            item("tax", "국세·지방세 완납 증명서", "TAX", true),
            item("insurance", "4대보험 완납증명서", "INSURANCE", false),
            item("ip", "지식재산권 보유현황", "OTHER", false)
    );

    public List<GrantDocumentItemDto> parse(String requirements) {
        if (requirements == null || requirements.isBlank()) {
            return DEFAULT_ITEMS;
        }

        List<String> lines = splitRequirements(requirements);
        if (lines.isEmpty()) {
            return DEFAULT_ITEMS;
        }

        List<GrantDocumentItemDto> items = new ArrayList<>();
        int order = 0;
        for (String line : lines) {
            String cleaned = cleanLine(line);
            if (cleaned.length() < 2) {
                continue;
            }
            String type = inferType(cleaned);
            items.add(GrantDocumentItemDto.builder()
                    .key(slug(cleaned, order++))
                    .label(cleaned)
                    .type(type)
                    .required(isRequired(cleaned))
                    .templateCode(mapTemplateCode(type))
                    .build());
        }

        return items.isEmpty() ? DEFAULT_ITEMS : items;
    }

    private List<String> splitRequirements(String requirements) {
        List<String> result = new ArrayList<>();
        for (String part : SPLIT_PATTERN.split(requirements)) {
            String trimmed = part.trim();
            if (trimmed.isBlank()) {
                continue;
            }
            if (trimmed.contains(",") || trimmed.contains("、")) {
                for (String sub : trimmed.split("[,、]")) {
                    if (!sub.trim().isBlank()) {
                        result.add(sub.trim());
                    }
                }
            } else {
                result.add(trimmed);
            }
        }
        return result;
    }

    private String cleanLine(String line) {
        return BULLET_PREFIX.matcher(line.trim()).replaceFirst("").trim();
    }

    private boolean isRequired(String label) {
        String lower = label.toLowerCase(Locale.ROOT);
        return !(lower.contains("해당 시") || lower.contains("선택") || lower.contains("있을 경우"));
    }

    private String inferType(String label) {
        String lower = label.toLowerCase(Locale.ROOT);
        if (lower.contains("사업계획") || lower.contains("제안서") || lower.contains("계획서")) {
            return "BUSINESS_PLAN";
        }
        if (lower.contains("재무") || lower.contains("손익") || lower.contains("대차")) {
            return "FINANCIAL";
        }
        if (lower.contains("완납") || lower.contains("국세") || lower.contains("지방세") || lower.contains("납세")) {
            return "TAX";
        }
        if (lower.contains("4대보험") || lower.contains("보험") && lower.contains("완납")) {
            return "INSURANCE";
        }
        if (lower.contains("신청서") || lower.contains("지원서")) {
            return "APPLICATION";
        }
        if (lower.contains("사업자등록") || lower.contains("등록증") || lower.contains("증명서")) {
            return "CERTIFICATE";
        }
        return "OTHER";
    }

    private String mapTemplateCode(String type) {
        return switch (type) {
            case "BUSINESS_PLAN" -> "BUSINESS_PLAN";
            case "FINANCIAL" -> "FINANCIAL";
            case "TAX" -> "TAX";
            case "INSURANCE" -> "INSURANCE";
            case "APPLICATION" -> "APPLICATION";
            default -> null;
        };
    }

    private String slug(String label, int order) {
        String normalized = Normalizer.normalize(label, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9가-힣]+", "-")
                .replaceAll("^-|-$", "");
        if (normalized.length() > 40) {
            normalized = normalized.substring(0, 40);
        }
        if (normalized.isBlank()) {
            return "doc-" + order;
        }
        return normalized + "-" + order;
    }

    private static GrantDocumentItemDto item(String key, String label, String type, boolean required) {
        return GrantDocumentItemDto.builder()
                .key(key)
                .label(label)
                .type(type)
                .required(required)
                .templateCode(type.equals("OTHER") || type.equals("CERTIFICATE") ? null : type)
                .build();
    }
}
