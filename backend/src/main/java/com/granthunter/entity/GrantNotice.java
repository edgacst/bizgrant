package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * 정부 지원사업 공고 엔티티
 * 다양한 정부 사이트에서 스크래핑한 지원사업 정보를 저장합니다.
 */
@Entity
@Table(name = "grant_notices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"source", "source_id"})
}, indexes = {
    @Index(name = "idx_grant_apply_status", columnList = "apply_end, status"),
    @Index(name = "idx_grant_source", columnList = "source"),
    @Index(name = "idx_grant_category", columnList = "category")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantNotice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String source;       // bizinfo, g2b, mss, kstartup

    @Column(name = "source_id", nullable = false, length = 100)
    private String sourceId;     // 원본 사이트 내 고유 ID

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 200)
    private String organization; // 주관기관

    @Column(nullable = false, length = 100)
    private String category;     // R&D, 창업, 수출, 제조혁신, 인력, 마케팅 등

    @Column(name = "industry_tags", columnDefinition = "TEXT")
    private String industryTags; // 콤마 구분: 제조,IT,서비스,바이오

    @Column(name = "apply_start")
    private LocalDate applyStart;

    @Column(name = "apply_end", nullable = false)
    private LocalDate applyEnd;

    @Column(columnDefinition = "TEXT")
    private String budget;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "TEXT")
    private String eligibility;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(nullable = false, length = 1000)
    private String url;

    @Basic(fetch = FetchType.LAZY)
    @Column(columnDefinition = "TEXT")
    private String content;      // 공고 전문

    @Builder.Default
    @Column(length = 20)
    private String status = "active";

    @Column(name = "scraped_at")
    private ZonedDateTime scrapedAt;

    @PrePersist
    protected void onCreate() {
        if (scrapedAt == null) {
            scrapedAt = ZonedDateTime.now();
        }
    }
}
