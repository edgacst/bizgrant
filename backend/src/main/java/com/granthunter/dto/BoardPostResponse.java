package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardPostResponse {
    private Long id;
    private String title;
    private String content;
    private String excerpt;
    private Long authorId;
    private String authorName;
    private boolean pinned;
    private int viewCount;
    private boolean published;
    private boolean mine;
    private boolean editable;
    private String createdAt;
    private String updatedAt;
}
