package com.granthunter.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 여러 수집 소스의 공고 데이터를 공통 형식으로 정규화합니다.
 */
@Component
public class GrantNormalizer {

    public static final LocalDate ONGOING_END = LocalDate.of(2099, 12, 31);

    public String normalizeCategory(String raw) {
        if (raw == null || raw.isEmpty()) return "기타";
        String lower = raw.replaceAll("\\s+", "");
        if (lower.matches(".*(R&D|연구|기술개발|RND).*")) return "R&D";
        if (lower.matches(".*(창업|스타트업|벤처).*")) return "창업";
        if (lower.matches(".*(수출|해외|무역|글로벌).*")) return "수출";
        if (lower.matches(".*(제조|혁신|스마트|자동화|공정|설비).*")) return "제조혁신";
        if (lower.matches(".*(인력|채용|고용|교육|일자리).*")) return "인력";
        if (lower.matches(".*(마케팅|홍보|판로|브랜드|전시).*")) return "마케팅";
        if (lower.matches(".*(인증|특허|지식재산).*")) return "인증/특허";
        if (lower.matches(".*(융자|대출|보증|투자|펀드|금융).*")) return "금융";
        if (lower.matches(".*(컨설팅|경영|진단).*")) return "컨설팅";
        return "기타";
    }

    public LocalDate[] parsePeriod(String period) {
        LocalDate[] dates = {null, null};
        if (period == null || period.isEmpty()) return dates;
        if (period.contains("상시") || period.contains("수시") || period.contains("연중")) {
            dates[1] = ONGOING_END;
            return dates;
        }

        try {
            String[] parts = period.split("~");
            if (parts.length == 2) {
                dates[0] = parseFlexibleDate(parts[0].trim());
                dates[1] = parseFlexibleDate(parts[1].trim());
            } else {
                LocalDate single = parseFlexibleDate(period.trim());
                if (single != null) dates[1] = single;
            }
        } catch (DateTimeParseException ignored) {
        }
        return dates;
    }

    public LocalDate parseFlexibleDate(String raw) {
        if (raw == null || raw.isBlank()) return null;
        String normalized = raw
                .replaceAll("[년월일]", "-")
                .replace('.', '-')
                .replace('/', '-')
                .replaceAll("\\s+", "")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");

        String[] parts = normalized.split("-");
        if (parts.length == 3) {
            normalized = String.format("%s-%02d-%02d",
                    parts[0], Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
        }
        try {
            return LocalDate.parse(normalized, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException e) {
            Matcher m = Pattern.compile("(\\d{4})[-.](\\d{1,2})[-.](\\d{1,2})").matcher(raw);
            if (m.find()) {
                return LocalDate.of(
                        Integer.parseInt(m.group(1)),
                        Integer.parseInt(m.group(2)),
                        Integer.parseInt(m.group(3)));
            }
            return null;
        }
    }

    public LocalDate resolveApplyEnd(LocalDate applyEnd, String periodText) {
        if (applyEnd != null) return applyEnd;
        LocalDate[] dates = parsePeriod(periodText);
        if (dates[1] != null) return dates[1];
        return ONGOING_END;
    }

    public String extractBudget(String content) {
        if (content == null) return "";
        Pattern p = Pattern.compile("(지원규모|지원금액|지원한도|보조금)[：:]\\s*([^。.\\n]{0,50})");
        Matcher m = p.matcher(content);
        if (m.find()) return m.group(2).trim();
        return "";
    }

    public String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&amp;", "&")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public String mergePlainTextWithHtmlLinks(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        String plain = stripHtml(html);
        List<String> links = extractLinksFromHtml(html);
        if (links.isEmpty()) {
            return plain;
        }
        return plain + "\n" + String.join("\n", links);
    }

    public List<String> extractLinksFromHtml(String html) {
        if (html == null || html.isBlank()) {
            return List.of();
        }
        LinkedHashSet<String> urls = new LinkedHashSet<>();
        Pattern pattern = Pattern.compile("href\\s*=\\s*[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(html);
        while (matcher.find()) {
            String href = matcher.group(1).trim();
            if (href.startsWith("http") && !href.contains("javascript:")) {
                urls.add(href);
            }
        }
        return new ArrayList<>(urls);
    }

    public String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen);
    }

    public String extractIndustryTags(String title, String eligibility, String category) {
        String combined = (title != null ? title : "") + " " +
                (eligibility != null ? eligibility : "") + " " +
                (category != null ? category : "");

        String[][] industryPatterns = {
                {"제조", "제조업,제조,생산,공장"},
                {"IT/SW", "IT,SW,소프트웨어,정보통신,ICT,AI,인공지능,빅데이터,클라우드"},
                {"서비스", "서비스업,서비스,유통,물류,관광"},
                {"바이오", "바이오,헬스케어,의료,제약,생명공학"},
                {"콘텐츠", "콘텐츠,미디어,영상,게임,방송,문화"},
                {"환경/에너지", "환경,에너지,신재생,탄소,친환경"},
        };

        List<String> tags = new ArrayList<>();
        for (String[] pattern : industryPatterns) {
            for (String keyword : pattern[1].split(",")) {
                if (combined.contains(keyword)) {
                    tags.add(pattern[0]);
                    break;
                }
            }
        }
        return tags.isEmpty() ? null : String.join(",", tags);
    }
}
