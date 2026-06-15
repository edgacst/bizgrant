package com.granthunter.util;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

public final class AuthUtils {

    private AuthUtils() {}

    public static Long requireUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }
        try {
            return Long.parseLong(authentication.getPrincipal().toString());
        } catch (NumberFormatException ex) {
            throw new BadCredentialsException("유효하지 않은 인증 정보입니다.");
        }
    }
}
