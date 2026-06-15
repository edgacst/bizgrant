package com.granthunter.controller;

import com.granthunter.dto.PipelineItemResponse;
import com.granthunter.security.AuthenticationUtils;
import com.granthunter.service.PipelineService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pipeline")
@RequiredArgsConstructor
public class PipelineController {

    private final PipelineService pipelineService;

    private Long getUserId(Authentication auth) {
        return AuthenticationUtils.requireUserId(auth);
    }

    @GetMapping
    @Operation(summary = "파이프라인 목록")
    public ResponseEntity<List<PipelineItemResponse>> list(Authentication auth) {
        return ResponseEntity.ok(pipelineService.listForUser(getUserId(auth)));
    }

    @PostMapping("/add")
    @Operation(summary = "파이프라인 추가")
    public ResponseEntity<PipelineItemResponse> add(Authentication auth, @RequestBody Map<String, Object> body) {
        Long userId = getUserId(auth);
        if (body.get("grantId") == null) {
            throw new IllegalArgumentException("grantId는 필수입니다");
        }
        Long grantId = Long.valueOf(body.get("grantId").toString());
        String stage = (String) body.getOrDefault("stage", "DISCOVERED");
        String notes = (String) body.getOrDefault("notes", "");
        return ResponseEntity.ok(pipelineService.addItem(userId, grantId, stage, notes));
    }

    @PostMapping("/move")
    @Operation(summary = "파이프라인 단계 이동")
    public ResponseEntity<PipelineItemResponse> move(Authentication auth, @RequestBody Map<String, Object> body) {
        Long userId = getUserId(auth);
        Long grantId = Long.valueOf(body.get("grantId").toString());
        String stage = (String) body.get("stage");
        return ResponseEntity.ok(pipelineService.moveItem(userId, grantId, stage));
    }

    @DeleteMapping("/{grantId}")
    @Operation(summary = "파이프라인 삭제")
    public ResponseEntity<Map<String, String>> remove(Authentication auth, @PathVariable Long grantId) {
        pipelineService.removeItem(getUserId(auth), grantId);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    @PutMapping("/{grantId}")
    @Operation(summary = "파이프라인 아이템 업데이트")
    public ResponseEntity<PipelineItemResponse> update(
            Authentication auth,
            @PathVariable Long grantId,
            @RequestBody Map<String, Object> body) {
        Long userId = getUserId(auth);
        String notes = body.containsKey("notes") ? (String) body.get("notes") : null;
        String documents = body.containsKey("documents") ? body.get("documents").toString() : null;
        return ResponseEntity.ok(pipelineService.updateItem(userId, grantId, notes, documents));
    }

    @GetMapping("/stats")
    @Operation(summary = "파이프라인 통계")
    public ResponseEntity<Map<String, Object>> stats(Authentication auth) {
        return ResponseEntity.ok(pipelineService.statsForUser(getUserId(auth)));
    }
}
