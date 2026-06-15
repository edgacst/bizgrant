package com.granthunter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 설정
 * 개발 환경에서 프론트엔드(React/Vue 등)의 접근을 허용합니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",    // React dev server
                    "http://localhost:5173",    // Vite dev server
                    "http://localhost:4200",    // Angular dev server
                    "https://mundane-maturely-bulgur.ngrok-free.dev"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
