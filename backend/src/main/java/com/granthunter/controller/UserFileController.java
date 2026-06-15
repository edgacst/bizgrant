package com.granthunter.controller;

import com.granthunter.dto.UserFileDto;
import com.granthunter.service.UserFileService;
import com.granthunter.util.AuthUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-files")
@RequiredArgsConstructor
@Tag(name = "서류 보관함")
public class UserFileController {

    private final UserFileService userFileService;

    @GetMapping
    @Operation(summary = "보관 서류 목록")
    public ResponseEntity<List<UserFileDto>> listFiles(Authentication authentication) {
        return ResponseEntity.ok(userFileService.listFiles(AuthUtils.requireUserId(authentication)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "서류 업로드")
    public ResponseEntity<UserFileDto> uploadFile(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String documentType) throws IOException {
        UserFileDto saved = userFileService.uploadFile(
                AuthUtils.requireUserId(authentication),
                file,
                documentType);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{fileId}/download")
    @Operation(summary = "서류 다운로드")
    public ResponseEntity<Resource> downloadFile(
            Authentication authentication,
            @PathVariable Long fileId) {
        Long userId = AuthUtils.requireUserId(authentication);
        Resource resource = userFileService.downloadFile(userId, fileId);
        String filename = resource.getFilename() != null ? resource.getFilename() : "document";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''"
                        + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .body(resource);
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "서류 삭제")
    public ResponseEntity<Map<String, String>> deleteFile(
            Authentication authentication,
            @PathVariable Long fileId) throws IOException {
        userFileService.deleteFile(AuthUtils.requireUserId(authentication), fileId);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}
