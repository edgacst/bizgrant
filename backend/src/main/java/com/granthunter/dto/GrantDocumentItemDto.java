package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantDocumentItemDto {
    private String key;
    private String label;
    private String type;
    private boolean required;
    private String templateCode;
    private String officialFormUrl;
    private String hwpOfficialUrl;
    private String officialLinkLabel;
    private String officialSource;
    private String matchedTemplateName;
    private List<String> attachmentUrls;
}
