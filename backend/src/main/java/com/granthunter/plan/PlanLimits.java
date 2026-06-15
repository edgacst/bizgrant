package com.granthunter.plan;

import java.util.Set;

public record PlanLimits(
        PlanType planType,
        int maxMatchResults,
        boolean matchReasonsEnabled,
        boolean matchFlagsEnabled,
        int maxAlertCategories,
        int maxAlertIndustries,
        int maxDailyAlerts,
        int maxPipelineItems,
        int maxBookmarks,
        boolean checklistSaveEnabled,
        boolean templateAutofillEnabled,
        Set<String> allowedAlertChannels,
        int maxUserFiles,
        boolean grantCompareEnabled
) {
    public static PlanLimits forPlan(PlanType plan) {
        return switch (plan) {
            case FREE -> new PlanLimits(
                    plan,
                    10,
                    false,
                    false,
                    1,
                    2,
                    1,
                    1,
                    5,
                    false,
                    false,
                    Set.of("email"),
                    5,
                    false
            );
            case PRO -> new PlanLimits(
                    plan,
                    50,
                    true,
                    true,
                    10,
                    8,
                    30,
                    Integer.MAX_VALUE,
                    50,
                    true,
                    true,
                    Set.of("email", "telegram", "slack"),
                    50,
                    true
            );
            case ENTERPRISE, ADMIN -> new PlanLimits(
                    plan,
                    Integer.MAX_VALUE,
                    true,
                    true,
                    Integer.MAX_VALUE,
                    Integer.MAX_VALUE,
                    Integer.MAX_VALUE,
                    Integer.MAX_VALUE,
                    Integer.MAX_VALUE,
                    true,
                    true,
                    Set.of("email", "telegram", "slack"),
                    Integer.MAX_VALUE,
                    true
            );
        };
    }

    public boolean isUnlimited(int value) {
        return value == Integer.MAX_VALUE;
    }
}
