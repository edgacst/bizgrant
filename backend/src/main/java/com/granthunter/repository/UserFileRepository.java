package com.granthunter.repository;

import com.granthunter.entity.UserFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFileRepository extends JpaRepository<UserFile, Long> {
    List<UserFile> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserFile> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
}
