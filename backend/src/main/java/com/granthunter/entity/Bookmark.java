package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@Entity
@Table(
        name = "bookmarks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "grant_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "grant_id", nullable = false)
    private Long grantId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
    }
}
