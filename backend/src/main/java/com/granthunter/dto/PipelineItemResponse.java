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
public class PipelineItemResponse {
    private Long id;
    private Long grantId;
    private String title;
    private String organization;
    private String category;
    private String budget;
    private String stage;
    private String dueDate;
    private String notes;
    private List<String> documents;
    private Integer daysLeft;
    private String totalAmount;
    private String originalUrl;
}
