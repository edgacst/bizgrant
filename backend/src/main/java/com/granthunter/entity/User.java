package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

/**
 * 사용자 엔티티
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(name = "company_name", length = 200)
    private String companyName;

    @Column(name = "biz_number", length = 10)
    private String bizNumber;

    @Column(length = 50)
    private String industry;

    @Column(name = "company_size", length = 20)
    private String companySize;

    @Builder.Default
    @Column(length = 20)
    private String plan = "free";

    @Builder.Default
    @Column(length = 20)
    private String role = UserRole.USER;

    @Builder.Default
    @Column(length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
}
