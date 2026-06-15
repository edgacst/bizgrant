package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * 지원사업 공고 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantNoticeResponse {

    private Long id;
    private String source;
    private String sourceLabel;
    private String sourceId;
    private String title;
    private String organization;
    private String category;
    private String industryTags;
    private LocalDate applyStart;
    private LocalDate applyEnd;
    private String budget;
    private String eligibility;
    private String requirements;
    private String url;
    private String originalUrl;
    private String content;
    private String status;
    private ZonedDateTime scrapedAt;
}
