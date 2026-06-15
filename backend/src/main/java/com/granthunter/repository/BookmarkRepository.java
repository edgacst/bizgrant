package com.granthunter.repository;

import com.granthunter.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Bookmark> findByUserIdAndGrantId(Long userId, Long grantId);

    int countByUserId(Long userId);

    void deleteByUserId(Long userId);
}
