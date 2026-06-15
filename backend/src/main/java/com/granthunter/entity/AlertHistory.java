package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * 알림 발송 이력 엔티티
 */
@Entity
@Table(name = "alert_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "notice_id")
    private Long noticeId;

    @Column(name = "notice_title", length = 500)
    private String noticeTitle;

    @Column(length = 200)
    private String organization;

    @Column(name = "sent_at")
    private ZonedDateTime sentAt;

    @Column(length = 50)
    private String channel;

    @Column(name = "read_at")
    private ZonedDateTime readAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = ZonedDateTime.now();
        }
    }
}
