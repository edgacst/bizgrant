package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantChecklistResponse {
    private Long grantId;
    private String grantTitle;
    private String grantSource;
    private String grantUrl;
    private String requirementsRaw;
    private List<GrantDocumentItemDto> items;
    private List<String> checkedKeys;
    private Map<String, Long> attachments;
    private List<String> grantAttachmentUrls;
    private List<OfficialFormEntryDto> recommendedOfficialForms;
    private int totalCount;
    private int checkedCount;
}
