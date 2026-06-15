package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "user_files")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "original_name", nullable = false, length = 300)
    private String originalName;

    @Column(name = "storage_name", nullable = false, length = 300)
    private String storageName;

    @Column(name = "mime_type", length = 120)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "document_type", length = 30)
    private String documentType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
}
