package com.granthunter.service;

import com.granthunter.config.UploadPathConfig;
import com.granthunter.dto.UserFileDto;
import com.granthunter.entity.UserFile;
import com.granthunter.repository.UserFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserFileService {

    private final UserFileRepository userFileRepository;
    private final UploadPathConfig uploadPathConfig;
    private final PlanService planService;

    public List<UserFileDto> listFiles(Long userId) {
        return userFileRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public UserFileDto uploadFile(Long userId, MultipartFile file, String documentType) throws IOException {
        planService.assertCanUploadFile(userId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일을 선택해주세요.");
        }

        String originalName = sanitizeFilename(file.getOriginalFilename());
        String storageName = UUID.randomUUID() + "_" + originalName;
        Path userDir = uploadPathConfig.userDir(userId);
        Files.createDirectories(userDir);
        Path target = userDir.resolve(storageName).normalize();
        if (!target.startsWith(userDir)) {
            throw new IllegalArgumentException("잘못된 파일 경로입니다.");
        }
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        }

        UserFile saved = userFileRepository.save(UserFile.builder()
                .userId(userId)
                .originalName(originalName)
                .storageName(storageName)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .documentType(documentType != null ? documentType : "OTHER")
                .build());

        return toDto(saved);
    }

    public Resource downloadFile(Long userId, Long fileId) {
        UserFile userFile = userFileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
        Path path = uploadPathConfig.userDir(userId).resolve(userFile.getStorageName()).normalize();
        if (!Files.exists(path)) {
            throw new IllegalArgumentException("저장된 파일이 존재하지 않습니다.");
        }
        return new FileSystemResource(path.toFile()) {
            @Override
            public String getFilename() {
                return userFile.getOriginalName();
            }
        };
    }

    public UserFileDto getFileMeta(Long userId, Long fileId) {
        return userFileRepository.findByIdAndUserId(fileId, userId)
                .map(this::toDto)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteFile(Long userId, Long fileId) throws IOException {
        UserFile userFile = userFileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));
        Path path = uploadPathConfig.userDir(userId).resolve(userFile.getStorageName()).normalize();
        Files.deleteIfExists(path);
        userFileRepository.delete(userFile);
    }

    private UserFileDto toDto(UserFile file) {
        return UserFileDto.builder()
                .id(file.getId())
                .originalName(file.getOriginalName())
                .mimeType(file.getMimeType())
                .fileSize(file.getFileSize())
                .documentType(file.getDocumentType())
                .createdAt(file.getCreatedAt())
                .build();
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        return filename.replaceAll("[\\\\/:*?\"<>|]", "_");
    }
}
