package com.granthunter.security;

import com.granthunter.entity.User;
import com.granthunter.entity.UserRole;
import com.granthunter.service.AuthenticatedUserResolver;
import com.granthunter.service.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 인증 필터
 * 모든 요청에서 Bearer 토큰을 추출하여 인증 처리합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = extractTokenFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                String email = jwtTokenProvider.getEmailFromToken(jwt);
                Long userId = jwtTokenProvider.getUserIdFromToken(jwt);
                User user = authenticatedUserResolver.resolveUser(userId);
                String role = user.getRole();
                String authority = UserRole.ADMIN.equalsIgnoreCase(role) ? "ROLE_ADMIN" : "ROLE_USER";

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId.toString(),
                                null,
                                List.of(new SimpleGrantedAuthority(authority))
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT 인증 성공: userId={}, email={}, role={}", userId, email, role);
            }
        } catch (Exception e) {
            log.debug("JWT 인증 처리 중 오류: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * 요청 헤더에서 Bearer 토큰 추출
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
