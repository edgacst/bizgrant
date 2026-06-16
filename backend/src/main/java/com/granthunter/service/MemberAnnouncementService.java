package com.granthunter.service;

import com.granthunter.config.NewsletterProperties;
import com.granthunter.entity.User;
import com.granthunter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberAnnouncementService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final NewsletterProperties newsletterProperties;
    private final SiteEmailComposer siteEmailComposer;

    public Map<String, String> getAnnouncementTemplate() {
        return siteEmailComposer.memberAnnouncementTemplate();
    }

    public Map<String, Object> sendToAllMembers(String subject, String message) {
        String trimmedSubject = subject != null ? subject.trim() : "";
        String trimmedMessage = message != null ? message.trim() : "";

        if (trimmedSubject.isBlank()) {
            throw new IllegalArgumentException("제목을 입력해 주세요.");
        }
        if (trimmedMessage.isBlank()) {
            throw new IllegalArgumentException("내용을 입력해 주세요.");
        }
        if (trimmedSubject.length() > 200) {
            throw new IllegalArgumentException("제목은 200자 이하로 입력해 주세요.");
        }
        if (trimmedMessage.length() > 5000) {
            throw new IllegalArgumentException("내용은 5000자 이하로 입력해 주세요.");
        }

        List<User> recipients = userRepository.findAll().stream()
                .filter(user -> user.getEmail() != null && !user.getEmail().isBlank())
                .filter(user -> user.getStatus() == null || "ACTIVE".equalsIgnoreCase(user.getStatus()))
                .toList();

        int sent = 0;
        int failed = 0;

        for (User user : recipients) {
            try {
                sendEmail(user.getEmail(), trimmedSubject, siteEmailComposer.buildMemberAnnouncementBody(user, trimmedMessage));
                sent++;
            } catch (Exception e) {
                failed++;
                log.warn("회원 공지 발송 실패 ({}): {}", user.getEmail(), e.getMessage());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "success");
        result.put("recipientCount", recipients.size());
        result.put("sent", sent);
        result.put("failed", failed);
        return result;
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(newsletterProperties.getFrom());
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        mailSender.send(mail);
    }
}
