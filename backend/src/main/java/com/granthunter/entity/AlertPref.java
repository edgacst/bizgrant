package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * 사용자 알림 설정 엔티티
 */
@Entity
@Table(name = "alert_prefs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertPref {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(columnDefinition = "TEXT")
    private String categories;    // 관심 카테고리 (콤마 구분)

    @Column(columnDefinition = "TEXT")
    private String industries;    // 관심 산업군 (콤마 구분)

    @Column(name = "min_budget")
    private Long minBudget;       // 최소 지원금액

    @Column(length = 50)
    private String channel;       // telegram, slack, email

    @Column(name = "channel_id", length = 255)
    private String channelId;     // 수신처 ID

    @Builder.Default
    @Column(name = "enabled")
    private Boolean enabled = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
}
