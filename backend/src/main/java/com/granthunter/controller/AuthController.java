package com.granthunter.controller;

import com.granthunter.dto.JwtResponse;
import com.granthunter.dto.LoginRequest;
import com.granthunter.dto.SignupRequest;
import com.granthunter.dto.UserResponse;
import com.granthunter.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 인증 API 컨트롤러
 * 회원가입, 로그인, 토큰 갱신 엔드포인트를 제공합니다.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "인증", description = "회원가입, 로그인, 토큰 관리 API")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    @Operation(summary = "회원가입", description = "새 사용자를 등록하고 JWT 토큰을 발급합니다.")
    public ResponseEntity<JwtResponse> signup(@Valid @RequestBody SignupRequest request) {
        JwtResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 갱신", description = "Refresh Token으로 새 Access Token을 발급받습니다.")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        JwtResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회", description = "JWT 토큰으로 현재 로그인한 사용자 정보를 조회합니다.")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }
        UserResponse response = authService.getMe(Long.parseLong(authentication.getPrincipal().toString()));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    @Operation(summary = "회사 프로필 수정", description = "템플릿 자동완성에 사용되는 회사 정보를 수정합니다.")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @RequestBody com.granthunter.dto.UpdateProfileRequest request) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }
        UserResponse response = authService.updateProfile(
                Long.parseLong(authentication.getPrincipal().toString()),
                request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth/{provider}")
    @Operation(summary = "소셜 로그인 (개발용)", description = "OAuth 연동 전 개발 환경용 mock 로그인입니다.")
    public ResponseEntity<JwtResponse> oauthLogin(@PathVariable String provider) {
        JwtResponse response = authService.oauthLogin(provider);
        return ResponseEntity.ok(response);
    }
}
