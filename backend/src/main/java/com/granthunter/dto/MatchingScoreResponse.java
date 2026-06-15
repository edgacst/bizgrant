package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 매칭 점수 응답 DTO
 * 사용자와 공고 간의 매칭도 정보를 포함합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingScoreResponse {

    private Long noticeId;
    private String title;
    private String organization;
    private String category;
    private String industryTags;
    private LocalDate applyStart;
    private LocalDate applyEnd;
    private String budget;
    private String url;

    private int matchScore;              // 0~100 매칭 점수
    private List<String> matchReasons;   // 매칭 이유 목록
    private boolean matchedCategory;
    private boolean matchedIndustry;
    private boolean matchedSize;
}
