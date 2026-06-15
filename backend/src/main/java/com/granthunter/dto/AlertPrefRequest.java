package com.granthunter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 알림 설정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertPrefRequest {

    private String categories;    // 관심 카테고리 (콤마 구분)
    private String industries;    // 관심 산업군 (콤마 구분)
    private Long minBudget;       // 최소 지원금액
    private String channel;       // email, kakao, sms
    private String channelId;     // 수신처 ID
    private Boolean enabled;
}
