package com.granthunter.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 토큰 생성 및 검증 서비스
 * Access Token: 15분, Refresh Token: 7일
 */
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.access-token-expiration-ms}") long accessTokenExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    /**
     * Access Token 생성 (만료: 15분)
     */
    public String generateAccessToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, accessTokenExpirationMs);
    }

    public String generateRefreshToken(Long userId, String email, String role) {
        return generateToken(userId, email, role, refreshTokenExpirationMs);
    }

    /** @deprecated use overload with role */
    public String generateAccessToken(Long userId, String email) {
        return generateAccessToken(userId, email, "USER");
    }

    public String generateRefreshToken(Long userId, String email) {
        return generateRefreshToken(userId, email, "USER");
    }

    private String generateToken(Long userId, String email, String role, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role != null ? role : "USER")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    /**
     * 토큰에서 이메일(Subject) 추출
     */
    public String getEmailFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * 토큰에서 사용자 ID 추출
     */
    public Long getUserIdFromToken(String token) {
        return parseClaims(token).get("userId", Long.class);
    }

    public String getRoleFromToken(String token) {
        String role = parseClaims(token).get("role", String.class);
        return role != null ? role : "USER";
    }

    /**
     * 토큰 유효성 검증
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
