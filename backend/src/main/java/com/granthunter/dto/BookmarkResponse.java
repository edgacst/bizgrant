package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkResponse {
    private Long id;
    private Long grantId;
    private String title;
    private String organization;
    private String category;
    private String budget;
    private String applyEnd;
    private String originalUrl;
    private String createdAt;
}
