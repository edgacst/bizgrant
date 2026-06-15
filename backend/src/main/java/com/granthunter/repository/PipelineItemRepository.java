package com.granthunter.repository;

import com.granthunter.entity.PipelineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PipelineItemRepository extends JpaRepository<PipelineItem, Long> {
    List<PipelineItem> findByUserId(Long userId);
    Optional<PipelineItem> findByUserIdAndGrantId(Long userId, Long grantId);

    void deleteByUserId(Long userId);
}
