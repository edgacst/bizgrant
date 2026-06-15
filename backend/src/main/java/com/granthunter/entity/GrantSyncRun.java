package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Entity
@Table(name = "grant_sync_runs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantSyncRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String source;

    @Column(nullable = false, length = 20)
    private String status;

    private int fetched;
    private int created;
    private int updated;
    private int skipped;
    private int failed;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "started_at", nullable = false)
    private ZonedDateTime startedAt;

    @Column(name = "finished_at")
    private ZonedDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = ZonedDateTime.now();
        }
    }
}
