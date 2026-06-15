package com.granthunter.repository;

import com.granthunter.entity.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * 알림 발송 이력 Repository
 */
@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {

    List<AlertHistory> findByUserIdOrderBySentAtDesc(Long userId);

    List<AlertHistory> findByUserIdAndReadAtIsNull(Long userId);

    List<AlertHistory> findByUserIdAndIdInAndReadAtIsNull(Long userId, List<Long> ids);

    List<AlertHistory> findByUserIdAndIdIn(Long userId, List<Long> ids);

    long countByUserId(Long userId);

    long countByUserIdAndReadAtIsNull(Long userId);

    List<AlertHistory> findByUserIdAndNoticeId(Long userId, Long noticeId);

    @Query("SELECT ah.noticeId FROM AlertHistory ah WHERE ah.userId = :userId")
    List<Long> findNoticeIdsByUserId(@Param("userId") Long userId);

    void deleteByUserId(Long userId);

    long countByUserIdAndSentAtAfter(Long userId, ZonedDateTime since);
}
