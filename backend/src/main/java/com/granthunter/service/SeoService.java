package com.granthunter.service;

import com.granthunter.config.NewsletterProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeoService {

    private static final DateTimeFormatter W3C_DATE = DateTimeFormatter.ISO_LOCAL_DATE;

    private final NewsletterProperties newsletterProperties;

    public String buildSitemapXml() {
        String siteUrl = trimSlash(newsletterProperties.getSiteUrl());
        List<SitemapEntry> entries = new ArrayList<>();

        entries.add(entry(siteUrl + "/", "daily", "1.0"));
        entries.add(entry(siteUrl + "/about", "weekly", "0.7"));
        entries.add(entry(siteUrl + "/guide", "weekly", "0.8"));
        entries.add(entry(siteUrl + "/calendar", "daily", "0.5"));
        entries.add(entry(siteUrl + "/terms", "yearly", "0.3"));
        entries.add(entry(siteUrl + "/privacy", "yearly", "0.3"));

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (SitemapEntry entry : entries) {
            xml.append("  <url>\n");
            xml.append("    <loc>").append(escapeXml(entry.loc())).append("</loc>\n");
            if (entry.lastmod() != null) {
                xml.append("    <lastmod>").append(entry.lastmod()).append("</lastmod>\n");
            }
            xml.append("    <changefreq>").append(entry.changefreq()).append("</changefreq>\n");
            xml.append("    <priority>").append(entry.priority()).append("</priority>\n");
            xml.append("  </url>\n");
        }
        xml.append("</urlset>");
        return xml.toString();
    }

    private SitemapEntry entry(String loc, String changefreq, String priority) {
        return new SitemapEntry(loc, LocalDate.now().format(W3C_DATE), changefreq, priority);
    }

    private String trimSlash(String url) {
        if (url == null || url.isBlank()) {
            return "https://bizgrant.kr";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String escapeXml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private record SitemapEntry(String loc, String lastmod, String changefreq, String priority) {}
}
