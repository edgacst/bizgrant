package com.granthunter.repository;

import com.granthunter.entity.GrantSyncRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrantSyncRunRepository extends JpaRepository<GrantSyncRun, Long> {

    List<GrantSyncRun> findTop20ByOrderByStartedAtDesc();

    Optional<GrantSyncRun> findTopBySourceOrderByStartedAtDesc(String source);
}
