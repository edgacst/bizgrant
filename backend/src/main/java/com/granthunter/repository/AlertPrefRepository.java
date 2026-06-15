package com.granthunter.repository;

import com.granthunter.entity.AlertPref;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 알림 설정 Repository
 */
@Repository
public interface AlertPrefRepository extends JpaRepository<AlertPref, Long> {

    Optional<AlertPref> findByUserId(Long userId);

    List<AlertPref> findByEnabledTrue();

    void deleteByUserId(Long userId);
}
