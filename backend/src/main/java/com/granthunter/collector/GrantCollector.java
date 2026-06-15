package com.granthunter.collector;

/**
 * 개별 정부 지원사업 소스 수집기
 */
public interface GrantCollector {
    GrantSource getSource();

    boolean isEnabled();

    CollectorResult collect();
}
