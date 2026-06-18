package com.granthunter.repository;

import com.granthunter.entity.BoardPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {

    @Query("""
            SELECT p FROM BoardPost p
            WHERE p.published = true
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<BoardPost> searchPublished(@Param("keyword") String keyword, Pageable pageable);

    Page<BoardPost> findByPublishedTrue(Pageable pageable);
}
