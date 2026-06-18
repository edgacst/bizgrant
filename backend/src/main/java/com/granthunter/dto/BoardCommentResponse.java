package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardCommentResponse {
    private Long id;
    private Long postId;
    private Long parentId;
    private Long authorId;
    private String authorName;
    private String content;
    private boolean mine;
    private boolean deletable;
    private String createdAt;
    @Builder.Default
    private List<BoardCommentResponse> replies = new ArrayList<>();
}
