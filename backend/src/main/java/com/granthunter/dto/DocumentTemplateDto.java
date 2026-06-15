package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTemplateDto {
    private String code;
    private String name;
    private String description;
    private String type;
    private boolean autoFillSupported;
    private String officialUrl;
    private String hwpOfficialUrl;
    private String sourceLabel;
}
