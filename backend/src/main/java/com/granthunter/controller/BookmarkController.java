package com.granthunter.controller;

import com.granthunter.dto.BookmarkResponse;
import com.granthunter.security.AuthenticationUtils;
import com.granthunter.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    private Long getUserId(Authentication auth) {
        return AuthenticationUtils.requireUserId(auth);
    }

    @GetMapping
    @Operation(summary = "북마크 목록")
    public ResponseEntity<List<BookmarkResponse>> list(Authentication auth) {
        return ResponseEntity.ok(bookmarkService.listForUser(getUserId(auth)));
    }

    @GetMapping("/ids")
    @Operation(summary = "북마크 공고 ID 목록")
    public ResponseEntity<List<Long>> ids(Authentication auth) {
        return ResponseEntity.ok(bookmarkService.grantIdsForUser(getUserId(auth)));
    }

    @GetMapping("/check/{grantId}")
    @Operation(summary = "북마크 여부 확인")
    public ResponseEntity<Map<String, Boolean>> check(Authentication auth, @PathVariable Long grantId) {
        return ResponseEntity.ok(Map.of(
                "bookmarked", bookmarkService.isBookmarked(getUserId(auth), grantId)
        ));
    }

    @PostMapping
    @Operation(summary = "북마크 추가")
    public ResponseEntity<BookmarkResponse> add(Authentication auth, @RequestBody Map<String, Object> body) {
        if (body.get("grantId") == null) {
            throw new IllegalArgumentException("grantId는 필수입니다");
        }
        Long grantId = Long.valueOf(body.get("grantId").toString());
        return ResponseEntity.ok(bookmarkService.addBookmark(getUserId(auth), grantId));
    }

    @DeleteMapping("/{grantId}")
    @Operation(summary = "북마크 삭제")
    public ResponseEntity<Map<String, String>> remove(Authentication auth, @PathVariable Long grantId) {
        bookmarkService.removeBookmark(getUserId(auth), grantId);
        return ResponseEntity.ok(Map.of("status", "deleted"));
    }
}
