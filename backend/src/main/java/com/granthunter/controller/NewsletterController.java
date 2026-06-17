package com.granthunter.controller;

import com.granthunter.entity.NewsletterSubscriber;
import com.granthunter.entity.User;
import com.granthunter.repository.NewsletterSubscriberRepository;
import com.granthunter.repository.UserRepository;
import com.granthunter.security.AuthenticationUtils;
import com.granthunter.service.NewsletterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
@Tag(name = "뉴스레터")
public class NewsletterController {

    private final NewsletterSubscriberRepository repository;
    private final NewsletterService newsletterService;
    private final UserRepository userRepository;

    @PostMapping("/subscribe")
    @Operation(summary = "뉴스레터 구독 (회원 전용)")
    public ResponseEntity<Map<String, Object>> subscribe(Authentication auth) {
        Long userId = AuthenticationUtils.requireUserId(auth);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        String email = user.getEmail().trim().toLowerCase();
        if (email.isEmpty() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "회원 이메일 정보가 올바르지 않습니다. 마이페이지에서 확인해 주세요."
            ));
        }

        var existing = repository.findByEmail(email);
        if (existing.isPresent()) {
            NewsletterSubscriber subscriber = existing.get();
            if (!subscriber.isActive()) {
                subscriber.setActive(true);
                if (subscriber.getUnsubscribeToken() == null || subscriber.getUnsubscribeToken().isBlank()) {
                    subscriber.setUnsubscribeToken(UUID.randomUUID().toString());
                }
                repository.save(subscriber);
                return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "뉴스레터 구독이 다시 활성화되었습니다."
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "이미 구독 중인 이메일입니다."
            ));
        }

        repository.save(NewsletterSubscriber.builder()
                .email(email)
                .unsubscribeToken(UUID.randomUUID().toString())
                .active(true)
                .build());

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "뉴스레터 구독이 완료되었습니다. 매주 월요일 오전 요약 메일을 보내드립니다."
        ));
    }

    @PostMapping("/unsubscribe")
    @Operation(summary = "뉴스레터 구독 해지")
    public ResponseEntity<Map<String, Object>> unsubscribePost(@RequestBody Map<String, String> body) {
        String token = body.getOrDefault("token", "").trim();
        return buildUnsubscribeResponse(token);
    }

    @GetMapping("/unsubscribe")
    @Operation(summary = "뉴스레터 구독 해지 (링크)")
    public ResponseEntity<Map<String, Object>> unsubscribeGet(@RequestParam String token) {
        return buildUnsubscribeResponse(token);
    }

    @PostMapping("/send-weekly")
    @Operation(summary = "주간 뉴스레터 수동 발송")
    public ResponseEntity<Map<String, Object>> sendWeekly() {
        return ResponseEntity.ok(newsletterService.sendWeeklyDigest());
    }

    @GetMapping("/stats")
    @Operation(summary = "뉴스레터 구독 현황")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(newsletterService.getStats());
    }

    private ResponseEntity<Map<String, Object>> buildUnsubscribeResponse(String token) {
        if (token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "유효하지 않은 구독 해지 링크입니다."
            ));
        }
        boolean success = newsletterService.unsubscribe(token);
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "구독 정보를 찾을 수 없습니다."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "뉴스레터 구독이 해지되었습니다."
        ));
    }
}
