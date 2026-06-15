package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFileDto {
    private Long id;
    private String originalName;
    private String mimeType;
    private Long fileSize;
    private String documentType;
    private ZonedDateTime createdAt;
}
