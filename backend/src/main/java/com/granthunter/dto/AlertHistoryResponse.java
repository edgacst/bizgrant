package com.granthunter.dto;

import com.granthunter.entity.AlertHistory;
import com.granthunter.entity.GrantNotice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertHistoryResponse {
    private Long id;
    private Long userId;
    private Long noticeId;
    private ZonedDateTime sentAt;
    private ZonedDateTime readAt;
    private String channel;
    private String noticeTitle;
    private String organization;
    private String category;
    private String applyEnd;
    private String status;

    public static AlertHistoryResponse from(AlertHistory history, GrantNotice grant) {
        String title = firstNonBlank(
                history.getNoticeTitle(),
                grant != null ? grant.getTitle() : null
        );
        String org = firstNonBlank(
                history.getOrganization(),
                grant != null ? grant.getOrganization() : null
        );
        return AlertHistoryResponse.builder()
                .id(history.getId())
                .userId(history.getUserId())
                .noticeId(history.getNoticeId())
                .sentAt(history.getSentAt())
                .readAt(history.getReadAt())
                .channel(history.getChannel())
                .noticeTitle(title)
                .organization(org)
                .category(grant != null ? grant.getCategory() : null)
                .applyEnd(grant != null && grant.getApplyEnd() != null ? grant.getApplyEnd().toString() : null)
                .status("sent")
                .build();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
