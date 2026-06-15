package com.granthunter.security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;

public final class AuthenticationUtils {

    private AuthenticationUtils() {}

    public static Long requireUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }

        Object principal = auth.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }

        try {
            return Long.parseLong(auth.getName());
        } catch (NumberFormatException ex) {
            throw new BadCredentialsException("인증이 필요합니다. 로그인 후 다시 시도해주세요.");
        }
    }
}
