package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_grant_checklists", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "grant_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserGrantChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "grant_id", nullable = false)
    private Long grantId;

    @Column(name = "checked_keys", columnDefinition = "text")
    @Builder.Default
    private String checkedKeysJson = "[]";

    @Column(name = "attachments", columnDefinition = "text")
    @Builder.Default
    private String attachmentsJson = "{}";

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        ZonedDateTime now = ZonedDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
