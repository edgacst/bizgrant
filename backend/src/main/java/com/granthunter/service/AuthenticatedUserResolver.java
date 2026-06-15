package com.granthunter.service;

import com.granthunter.config.AdminProperties;
import com.granthunter.entity.User;
import com.granthunter.entity.UserRole;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserResolver {

    private final UserRepository userRepository;
    private final AdminProperties adminProperties;

    @Transactional
    public User resolveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));
        applyAdminRoleIfConfigured(user);
        return user;
    }

    private void applyAdminRoleIfConfigured(User user) {
        if (!isAdminEmail(user.getEmail())) {
            return;
        }
        if (!UserRole.ADMIN.equalsIgnoreCase(user.getRole())) {
            user.setRole(UserRole.ADMIN);
            userRepository.save(user);
        }
    }

    private boolean isAdminEmail(String email) {
        if (email == null || adminProperties.getEmails() == null) {
            return false;
        }
        String normalized = email.trim().toLowerCase();
        return adminProperties.getEmails().stream()
                .filter(e -> e != null && !e.isBlank())
                .map(e -> e.trim().toLowerCase())
                .anyMatch(normalized::equals);
    }
}
