package com.granthunter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * GrantHunter - 정부 지원사업 알림 SaaS 백엔드
 * 정부 지원사업 공고를 자동 수집하고, 사용자 맞춤형 알림을 제공합니다.
 */
@SpringBootApplication
@EnableScheduling
@org.springframework.boot.context.properties.EnableConfigurationProperties({
        com.granthunter.config.GrantSyncProperties.class,
        com.granthunter.config.NewsletterProperties.class,
        com.granthunter.config.AdminProperties.class
})
public class GrantHunterApplication {

    public static void main(String[] args) {
        SpringApplication.run(GrantHunterApplication.class, args);
    }
}
