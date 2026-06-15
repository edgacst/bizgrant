package com.granthunter.config;

import com.granthunter.entity.User;
import com.granthunter.entity.UserRole;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties adminProperties;

    @Override
    public void run(String... args) {
        for (String rawEmail : adminProperties.getEmails()) {
            if (rawEmail == null || rawEmail.isBlank()) {
                continue;
            }
            String email = rawEmail.trim().toLowerCase();
            userRepository.findByEmail(email).ifPresentOrElse(
                    user -> promoteIfNeeded(user, email),
                    () -> createAdmin(email)
            );
        }
    }

    private void promoteIfNeeded(User user, String email) {
        boolean changed = false;
        if (!UserRole.ADMIN.equalsIgnoreCase(user.getRole())) {
            user.setRole(UserRole.ADMIN);
            changed = true;
        }
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("ACTIVE");
            changed = true;
        }
        if (changed) {
            userRepository.save(user);
            log.info("관리자 권한 적용: {}", email);
        }
    }

    private void createAdmin(String email) {
        User admin = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(adminProperties.getInitialPassword()))
                .name(adminProperties.getInitialName())
                .companyName(adminProperties.getInitialCompany())
                .industry("IT/소프트웨어")
                .companySize("10인 미만")
                .plan("admin")
                .role(UserRole.ADMIN)
                .status("ACTIVE")
                .build();
        userRepository.save(admin);
        log.info("관리자 계정 생성: {} (초기 비밀번호는 app.admin.initial-password 참고)", email);
    }
}
