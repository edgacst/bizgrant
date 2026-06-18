package com.granthunter.controller;

import com.granthunter.dto.BoardPostRequest;
import com.granthunter.dto.BoardPostResponse;
import com.granthunter.security.AuthenticationUtils;
import com.granthunter.service.BoardPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@Tag(name = "공개 게시판")
public class BoardPostController {

    private final BoardPostService boardPostService;

    @GetMapping("/posts")
    @Operation(summary = "게시글 목록 (공개)")
    public ResponseEntity<Page<BoardPostResponse>> list(
            Authentication auth,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Long viewerId = resolveOptionalUserId(auth);
        return ResponseEntity.ok(boardPostService.listPublished(q, page, Math.min(size, 50), viewerId, isAdmin(auth)));
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "게시글 상세 (공개)")
    public ResponseEntity<BoardPostResponse> detail(@PathVariable Long id, Authentication auth) {
        Long viewerId = resolveOptionalUserId(auth);
        return ResponseEntity.ok(boardPostService.getPublished(id, viewerId, isAdmin(auth)));
    }

    @PostMapping("/posts")
    @Operation(summary = "게시글 작성 (회원)")
    public ResponseEntity<BoardPostResponse> create(Authentication auth, @RequestBody BoardPostRequest body) {
        Long userId = AuthenticationUtils.requireUserId(auth);
        return ResponseEntity.ok(boardPostService.create(userId, body));
    }

    @PutMapping("/posts/{id}")
    @Operation(summary = "게시글 수정 (작성자·관리자)")
    public ResponseEntity<BoardPostResponse> update(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody BoardPostRequest body) {
        Long userId = AuthenticationUtils.requireUserId(auth);
        return ResponseEntity.ok(boardPostService.update(id, userId, isAdmin(auth), body));
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "게시글 삭제 (작성자·관리자)")
    public ResponseEntity<Map<String, String>> delete(Authentication auth, @PathVariable Long id) {
        Long userId = AuthenticationUtils.requireUserId(auth);
        boardPostService.delete(id, userId, isAdmin(auth));
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }

    @PatchMapping("/posts/{id}/pin")
    @Operation(summary = "게시글 고정 (관리자)")
    public ResponseEntity<BoardPostResponse> pin(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        requireAdmin(auth);
        boolean pinned = Boolean.TRUE.equals(body.get("pinned"));
        return ResponseEntity.ok(boardPostService.setPinned(id, pinned));
    }

    private Long resolveOptionalUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isAdmin(Authentication auth) {
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private void requireAdmin(Authentication auth) {
        if (!isAdmin(auth)) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
    }
}
