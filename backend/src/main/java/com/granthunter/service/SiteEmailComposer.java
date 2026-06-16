package com.granthunter.service;

import com.granthunter.config.NewsletterProperties;
import com.granthunter.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 회원 공지·뉴스레터 등 사이트 발송 메일의 공통 본문·푸터를 구성합니다.
 */
@Component
@RequiredArgsConstructor
public class SiteEmailComposer {

    private static final String SUPPORT_EMAIL = "freecompr@naver.com";

    private final NewsletterProperties newsletterProperties;

    public Map<String, String> memberAnnouncementTemplate() {
        String siteUrl = siteUrl();
        Map<String, String> template = new LinkedHashMap<>();
        template.put("subjectExample", "[BizGrant] 서비스 점검 안내");
        template.put("messageTemplate", """
                BizGrant 운영팀입니다.

                [공지 한 줄 요약]

                ■ 안내 내용
                (여기에 상세 내용을 작성하세요)

                ■ 일시·기간 (해당 시)
                -

                ■ 회원님께서 확인해 주실 사항
                -
                """);
        template.put("autoFooterPreview", buildMemberAnnouncementFooter());
        template.put("siteUrl", siteUrl);
        template.put("supportEmail", SUPPORT_EMAIL);
        template.put("writingTips", """
                제목은 [BizGrant]로 시작하면 받은편지함에서 구분하기 쉽습니다.
                링크는 본문에 직접 넣지 않아도 됩니다. 발송 시 사이트·공고·알림 링크가 자동으로 붙습니다.
                공지·점검·기능 안내 등 서비스 관련 내용만 보내 주세요. (뉴스레터 구독자 발송과 별개)
                """);
        return template;
    }

    public String buildMemberAnnouncementBody(User user, String message) {
        String name = user.getName() != null && !user.getName().isBlank() ? user.getName() : "회원";
        return name + "님, 안녕하세요.\n\n"
                + message.trim()
                + "\n\n"
                + buildMemberAnnouncementFooter();
    }

    public String buildMemberAnnouncementFooter() {
        String siteUrl = siteUrl();
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("BizGrant 바로가기\n");
        sb.append("• 정부지원금사업 탐색: ").append(siteUrl).append("/grants\n");
        sb.append("• 내 대시보드: ").append(siteUrl).append("/dashboard\n");
        sb.append("• 알림 설정: ").append(siteUrl).append("/alerts\n");
        sb.append("• 마이페이지: ").append(siteUrl).append("/mypage\n");
        sb.append("• 요금 안내: ").append(siteUrl).append("/pricing\n\n");
        sb.append("문의: ").append(SUPPORT_EMAIL).append('\n');
        sb.append("본 메일은 BizGrant 가입 회원에게 발송된 서비스 공지입니다.\n");
        return sb.toString();
    }

    public String siteUrl() {
        String url = newsletterProperties.getSiteUrl();
        if (url == null || url.isBlank()) {
            return "https://bizgrant.kr";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
