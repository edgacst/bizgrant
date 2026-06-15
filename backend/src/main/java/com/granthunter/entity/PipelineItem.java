package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "pipeline_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "grant_id", nullable = false)
    private Long grantId;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String stage = "DISCOVERED";

    @Column(columnDefinition = "text")
    private String notes;

    @Column(columnDefinition = "text")
    private String documents;

    @Column(name = "expected_budget", length = 100)
    private String expectedBudget;

    @Column(name = "submitted_at")
    private ZonedDateTime submittedAt;

    @Column(name = "result_at")
    private ZonedDateTime resultAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
