package com.granthunter.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "newsletter_subscribers", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(name = "unsubscribe_token", length = 64, unique = true)
    private String unsubscribeToken;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "subscribed_at", nullable = false)
    private ZonedDateTime subscribedAt;

    @Column(name = "last_sent_at")
    private ZonedDateTime lastSentAt;

    @PrePersist
    protected void onCreate() {
        if (subscribedAt == null) {
            subscribedAt = ZonedDateTime.now();
        }
        if (unsubscribeToken == null || unsubscribeToken.isBlank()) {
            unsubscribeToken = UUID.randomUUID().toString();
        }
    }
}
