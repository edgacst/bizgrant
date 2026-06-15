package com.granthunter.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class PlanInfoResponse {
    private String plan;
    private String planLabel;
    private PlanLimitsDto limits;
    private PlanUsageDto usage;

    @Data
    @Builder
    public static class PlanLimitsDto {
        private int maxMatchResults;
        private boolean matchReasonsEnabled;
        private boolean matchFlagsEnabled;
        private int maxAlertCategories;
        private int maxAlertIndustries;
        private int maxDailyAlerts;
        private int maxPipelineItems;
        private int maxBookmarks;
        private boolean checklistSaveEnabled;
        private boolean templateAutofillEnabled;
        private List<String> allowedAlertChannels;
        private int maxUserFiles;
        private boolean grantCompareEnabled;
    }

    @Data
    @Builder
    public static class PlanUsageDto {
        private int pipelineItems;
        private int bookmarks;
        private int alertsSentToday;
        private int userFiles;
        private int matchResultsCap;
    }

    public static PlanLimitsDto toLimitsDto(com.granthunter.plan.PlanLimits limits) {
        return PlanLimitsDto.builder()
                .maxMatchResults(limits.isUnlimited(limits.maxMatchResults()) ? -1 : limits.maxMatchResults())
                .matchReasonsEnabled(limits.matchReasonsEnabled())
                .matchFlagsEnabled(limits.matchFlagsEnabled())
                .maxAlertCategories(limits.isUnlimited(limits.maxAlertCategories()) ? -1 : limits.maxAlertCategories())
                .maxAlertIndustries(limits.isUnlimited(limits.maxAlertIndustries()) ? -1 : limits.maxAlertIndustries())
                .maxDailyAlerts(limits.isUnlimited(limits.maxDailyAlerts()) ? -1 : limits.maxDailyAlerts())
                .maxPipelineItems(limits.isUnlimited(limits.maxPipelineItems()) ? -1 : limits.maxPipelineItems())
                .maxBookmarks(limits.isUnlimited(limits.maxBookmarks()) ? -1 : limits.maxBookmarks())
                .checklistSaveEnabled(limits.checklistSaveEnabled())
                .templateAutofillEnabled(limits.templateAutofillEnabled())
                .allowedAlertChannels(List.copyOf(limits.allowedAlertChannels()))
                .maxUserFiles(limits.isUnlimited(limits.maxUserFiles()) ? -1 : limits.maxUserFiles())
                .grantCompareEnabled(limits.grantCompareEnabled())
                .build();
    }
}
