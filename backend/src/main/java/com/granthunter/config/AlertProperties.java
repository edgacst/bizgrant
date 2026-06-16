package com.granthunter.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.alert")
public class AlertProperties {

    private String siteName = "BizGrant";

    private Telegram telegram = new Telegram();

    private Solapi solapi = new Solapi();

    private Kakao kakao = new Kakao();

    @Data
    public static class Telegram {
        private String botToken = "";

        public boolean isConfigured() {
            return botToken != null && !botToken.isBlank();
        }
    }

    @Data
    public static class Solapi {
        private String apiKey = "";
        private String apiSecret = "";
        /** Solapi에 등록된 발신 번호 */
        private String sender = "";

        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank()
                    && apiSecret != null && !apiSecret.isBlank()
                    && sender != null && !sender.isBlank();
        }
    }

    @Data
    public static class Kakao {
        /** 카카오 채널(플러스친구) PF ID */
        private String pfId = "";
        /** 승인된 알림톡 템플릿 ID */
        private String templateId = "";
        /** 템플릿 본문 변수명 (예: #{내용}) */
        private String contentVariable = "#{내용}";

        public boolean isAlimtalkConfigured() {
            return pfId != null && !pfId.isBlank()
                    && templateId != null && !templateId.isBlank();
        }
    }
}
