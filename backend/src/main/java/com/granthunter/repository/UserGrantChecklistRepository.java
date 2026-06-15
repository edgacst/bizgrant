package com.granthunter.repository;

import com.granthunter.entity.UserGrantChecklist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGrantChecklistRepository extends JpaRepository<UserGrantChecklist, Long> {
    Optional<UserGrantChecklist> findByUserIdAndGrantId(Long userId, Long grantId);
}
