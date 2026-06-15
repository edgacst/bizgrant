package com.granthunter.repository;

import com.granthunter.entity.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, Long> {
    Optional<NewsletterSubscriber> findByEmail(String email);

    Optional<NewsletterSubscriber> findByUnsubscribeToken(String unsubscribeToken);

    List<NewsletterSubscriber> findByActiveTrue();
}
