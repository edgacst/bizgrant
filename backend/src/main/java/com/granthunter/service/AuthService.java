package com.granthunter.service;

import com.granthunter.config.AdminProperties;
import com.granthunter.dto.JwtResponse;
import com.granthunter.dto.LoginRequest;
import com.granthunter.dto.SignupRequest;
import com.granthunter.dto.UserResponse;
import com.granthunter.entity.User;
import com.granthunter.entity.UserRole;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 서비스
 * 회원가입, 로그인, 토큰 갱신을 처리합니다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AdminProperties adminProperties;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    /**
     * 회원가입
     * 이메일 중복 검사 후 사용자 등록
     */
    @Transactional
    public JwtResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }

        String normalizedBizNumber = normalizeBizNumber(request.getBizNumber());

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .phone(request.getPhone())
                .companyName(request.getCompanyName())
                .bizNumber(normalizedBizNumber)
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .role(resolveRole(request.getEmail()))
                .build();

        user = userRepository.save(user);

        return buildJwtResponse(user);
    }

    /**
     * 로그인
     * 이메일/비밀번호 검증 후 JWT 발급
     */
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }

        applyAdminRoleIfConfigured(user);

        return buildJwtResponse(user);
    }

    /**
     * Refresh Token으로 새 Access Token 발급
     */
    public JwtResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("유효하지 않은 Refresh Token입니다.");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));

        applyAdminRoleIfConfigured(user);

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());

        return JwtResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    private JwtResponse buildJwtResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
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

    private String resolveRole(String email) {
        return isAdminEmail(email) ? UserRole.ADMIN : UserRole.USER;
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

    private String normalizeBizNumber(String bizNumber) {
        if (bizNumber == null || bizNumber.isBlank()) {
            return null;
        }

        String digitsOnly = bizNumber.replaceAll("\\D", "");
        if (digitsOnly.length() != 10) {
            throw new IllegalArgumentException("사업자번호는 숫자 10자리여야 합니다.");
        }

        return digitsOnly;
    }

    /**
     * JWT 인증 시 DB 기준 최신 역할을 반환합니다.
     * 토큰 발급 이후 관리자 승격 등 역할 변경을 반영합니다.
     */
    @Transactional
    public User resolveAuthenticatedUser(Long userId) {
        return authenticatedUserResolver.resolveUser(userId);
    }

    /**
     * 사용자 정보 조회
     */
    public UserResponse getMe(Long userId) {
        User user = resolveAuthenticatedUser(userId);

        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .companyName(user.getCompanyName())
                .bizNumber(user.getBizNumber())
                .industry(user.getIndustry())
                .companySize(user.getCompanySize())
                .plan(user.getPlan())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public UserResponse updateProfile(Long userId, com.granthunter.dto.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("사용자를 찾을 수 없습니다."));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            user.setCompanyName(request.getCompanyName().trim());
        }
        if (request.getBizNumber() != null && !request.getBizNumber().isBlank()) {
            user.setBizNumber(normalizeBizNumber(request.getBizNumber()));
        }
        if (request.getIndustry() != null && !request.getIndustry().isBlank()) {
            user.setIndustry(request.getIndustry().trim());
        }
        if (request.getCompanySize() != null && !request.getCompanySize().isBlank()) {
            user.setCompanySize(request.getCompanySize().trim());
        }

        userRepository.save(user);
        return getMe(userId);
    }

    /**
     * 개발용 소셜 로그인 (OAuth 연동 전 mock)
     */
    @Transactional
    public JwtResponse oauthLogin(String provider) {
        String email = "oauth-" + provider + "@bizgrant.dev";

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String displayName = switch (provider) {
                case "google" -> "Google 사용자";
                case "naver" -> "네이버 사용자";
                case "kakao" -> "카카오 사용자";
                default -> "소셜 사용자";
            };

            User newUser = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode("oauth-" + provider))
                    .name(displayName)
                    .companyName("BizGrant")
                    .industry("IT/소프트웨어")
                    .companySize("10인 미만")
                    .status("ACTIVE")
                    .build();
            return userRepository.save(newUser);
        });

        return buildJwtResponse(user);
    }
}
