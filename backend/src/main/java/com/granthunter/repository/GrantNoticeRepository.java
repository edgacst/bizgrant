package com.granthunter.repository;

import com.granthunter.entity.GrantNotice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GrantNoticeRepository extends JpaRepository<GrantNotice, Long> {

    List<GrantNotice> findAllByOrderByApplyEndAsc();

    Page<GrantNotice> findByCategory(String category, Pageable pageable);

    @Query("SELECT g FROM GrantNotice g WHERE g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active')")
    List<GrantNotice> findByApplyEndAfter(@Param("today") LocalDate today);

    @Query("SELECT g FROM GrantNotice g WHERE g.applyEnd >= :today " +
           "AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "AND UPPER(g.source) NOT IN ('G2B', 'G2B_AWARD')")
    List<GrantNotice> findActiveSupportGrantNotices(@Param("today") LocalDate today);

    List<GrantNotice> findByCategoryAndIdNot(String category, Long id);

    @Query("SELECT g FROM GrantNotice g WHERE g.category = :category AND g.id <> :id " +
           "AND g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "ORDER BY g.applyEnd ASC")
    List<GrantNotice> findRelatedActiveNotices(
            @Param("category") String category,
            @Param("id") Long id,
            @Param("today") LocalDate today,
            Pageable pageable);

    Optional<GrantNotice> findBySourceAndSourceId(String source, String sourceId);

    @Query("SELECT g FROM GrantNotice g WHERE g.applyEnd >= :today " +
           "AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "AND (:source IS NULL OR g.source = :source) " +
           "AND (:excludeSource IS NULL OR (" +
           "  (:excludeSource = 'G2B' AND g.source NOT IN ('G2B', 'G2B_AWARD')) OR " +
           "  (:excludeSource <> 'G2B' AND g.source <> :excludeSource)" +
           ")) " +
           "AND (:category IS NULL OR g.category = :category) " +
           "AND (:keyword = '' OR LOWER(g.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "     LOWER(g.organization) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:applyEndFrom IS NULL OR g.applyEnd >= :applyEndFrom) " +
           "AND (:applyEndTo IS NULL OR g.applyEnd <= :applyEndTo)")
    Page<GrantNotice> findActiveNotices(
            @Param("today") LocalDate today,
            @Param("source") String source,
            @Param("excludeSource") String excludeSource,
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("applyEndFrom") LocalDate applyEndFrom,
            @Param("applyEndTo") LocalDate applyEndTo,
            Pageable pageable);

    @Query("SELECT COUNT(g) FROM GrantNotice g WHERE g.applyEnd >= :today " +
           "AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "AND (:source IS NULL OR g.source = :source) " +
           "AND (:excludeSource IS NULL OR (" +
           "  (:excludeSource = 'G2B' AND g.source NOT IN ('G2B', 'G2B_AWARD')) OR " +
           "  (:excludeSource <> 'G2B' AND g.source <> :excludeSource)" +
           "))")
    long countActiveNoticesFiltered(
            @Param("today") LocalDate today,
            @Param("source") String source,
            @Param("excludeSource") String excludeSource);

    @Query("SELECT COUNT(g) FROM GrantNotice g WHERE g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active')")
    long countActiveNotices(@Param("today") LocalDate today);

    @Query("SELECT g.source, COUNT(g) FROM GrantNotice g " +
           "WHERE g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "GROUP BY g.source ORDER BY COUNT(g) DESC")
    List<Object[]> countActiveBySource(@Param("today") LocalDate today);

    @Query("SELECT g FROM GrantNotice g WHERE g.applyEnd BETWEEN :start AND :end AND (g.status = 'ACTIVE' OR g.status = 'active')")
    List<GrantNotice> findEndingBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT g FROM GrantNotice g WHERE g.category IN :categories AND g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active')")
    List<GrantNotice> findMatchingByCategories(
            @Param("categories") List<String> categories,
            @Param("today") LocalDate today);

    @Query("SELECT g FROM GrantNotice g WHERE g.scrapedAt >= :since AND g.applyEnd >= :today " +
           "AND (g.status = 'ACTIVE' OR g.status = 'active') " +
           "AND UPPER(g.source) NOT IN ('G2B', 'G2B_AWARD') " +
           "ORDER BY g.scrapedAt DESC")
    Page<GrantNotice> findRecentActiveNotices(
            @Param("since") ZonedDateTime since,
            @Param("today") LocalDate today,
            Pageable pageable);

    @Query("SELECT g FROM GrantNotice g WHERE UPPER(g.source) = UPPER(:source) " +
           "AND g.applyEnd >= :today AND (g.status = 'ACTIVE' OR g.status = 'active')")
    List<GrantNotice> findActiveBySource(@Param("source") String source, @Param("today") LocalDate today);
}
