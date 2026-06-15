package com.granthunter.dto;

import lombok.Data;

import java.util.List;

@Data
public class OfficialFormEntryDto {
    private String code;
    private String name;
    private String sourceLabel;
    private List<String> sources;
    private List<String> documentTypes;
    private List<String> categories;
    private String officialUrl;
    private String hwpOfficialUrl;
    private String docxVariant;
}
