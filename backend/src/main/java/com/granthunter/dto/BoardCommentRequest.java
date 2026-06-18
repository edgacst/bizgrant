package com.granthunter.dto;

import lombok.Data;

@Data
public class BoardCommentRequest {
    private String content;
    private Long parentId;
}
