package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JWT 인증 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String email;
    private String name;
    private String role;
}
