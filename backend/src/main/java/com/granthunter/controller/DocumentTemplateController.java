package com.granthunter.controller;

import com.granthunter.dto.DocumentTemplateDto;
import com.granthunter.service.DocumentTemplateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/document-templates")
@RequiredArgsConstructor
@Tag(name = "서류 템플릿")
public class DocumentTemplateController {

    private final DocumentTemplateService documentTemplateService;

    @GetMapping
    @Operation(summary = "서류 템플릿 목록")
    public ResponseEntity<List<DocumentTemplateDto>> listTemplates(
            @RequestParam(required = false) Long grantId) {
        return ResponseEntity.ok(documentTemplateService.listTemplates(grantId));
    }

    @GetMapping("/{code}/download")
    @Operation(summary = "서류 템플릿 다운로드")
    public ResponseEntity<Resource> downloadTemplate(
            @PathVariable String code,
            @RequestParam(defaultValue = "docx") String format,
            @RequestParam(required = false) Long grantId,
            Authentication authentication) throws IOException {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() != null) {
            userId = Long.parseLong(authentication.getPrincipal().toString());
        }
        Resource resource = documentTemplateService.downloadTemplate(code, format, userId, grantId);
        String filename = resource.getFilename() != null ? resource.getFilename() : code + "-template." + format;

        MediaType mediaType = "hwp".equalsIgnoreCase(format)
                ? MediaType.APPLICATION_OCTET_STREAM
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''"
                        + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .body(resource);
    }
}
