package com.granthunter.controller;

import com.granthunter.dto.MemberAnnouncementRequest;
import com.granthunter.service.AdminService;
import com.granthunter.service.MemberAnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "관리자")
public class AdminController {

    private final AdminService adminService;
    private final MemberAnnouncementService memberAnnouncementService;

    @GetMapping("/dashboard")
    @Operation(summary = "관리자 대시보드")
    public ResponseEntity<Map<String, Object>> dashboard(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/users")
    @Operation(summary = "회원 목록 (이메일 검색)")
    public ResponseEntity<List<Map<String, Object>>> users(
            Authentication authentication,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "20") int limit) {
        requireAdmin(authentication);
        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(adminService.searchUsers(q, Math.min(limit, 50)));
        }
        return ResponseEntity.ok(adminService.listRecentUsers(Math.min(limit, 50)));
    }

    @PostMapping("/grants/sync")
    @Operation(summary = "지원사업 동기화 실행")
    public ResponseEntity<Map<String, Object>> syncGrants(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.triggerSync());
    }

    @PostMapping("/newsletter/send")
    @Operation(summary = "주간 뉴스레터 수동 발송")
    public ResponseEntity<Map<String, Object>> sendNewsletter(Authentication authentication) {
        requireAdmin(authentication);
        return ResponseEntity.ok(adminService.triggerNewsletter());
    }

    @PostMapping("/announcements/send")
    @Operation(summary = "전체 회원 공지 이메일 발송")
    public ResponseEntity<Map<String, Object>> sendMemberAnnouncement(
            Authentication authentication,
            @RequestBody MemberAnnouncementRequest body) {
        requireAdmin(authentication);
        if (body == null) {
            throw new IllegalArgumentException("요청 본문이 필요합니다.");
        }
        return ResponseEntity.ok(memberAnnouncementService.sendToAllMembers(body.getSubject(), body.getMessage()));
    }

    @PutMapping("/users/{id}/plan")
    @Operation(summary = "회원 요금제 변경")
    public ResponseEntity<Map<String, Object>> updateUserPlan(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        requireAdmin(authentication);
        String plan = body.get("plan");
        if (plan == null || plan.isBlank()) {
            throw new IllegalArgumentException("plan 값이 필요합니다.");
        }
        return ResponseEntity.ok(adminService.updateUserPlan(id, plan));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "회원 삭제")
    public ResponseEntity<Map<String, Object>> deleteUser(
            Authentication authentication,
            @PathVariable Long id) {
        requireAdmin(authentication);
        Long adminUserId = Long.parseLong(authentication.getPrincipal().toString());
        return ResponseEntity.ok(adminService.deleteUser(adminUserId, id));
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!isAdmin) {
            throw new AccessDeniedException("관리자 권한이 필요합니다.");
        }
    }
}
