-- GrantHunter Core Schema V1
-- 정부 지원사업 알림 SaaS 초기 스키마

-- 사용자 (MVP: 단일 테넌트, 간소화된 구조)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(200),
    biz_number VARCHAR(10),
    industry VARCHAR(50),
    company_size VARCHAR(20),
    plan VARCHAR(20) DEFAULT 'free',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 지원사업 공고 (정부 사이트에서 스크래핑)
CREATE TABLE grant_notices (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,        -- g2b, bizinfo, mss, kstartup
    source_id VARCHAR(100) NOT NULL,    -- 원본 사이트의 고유 ID
    title VARCHAR(500) NOT NULL,
    organization VARCHAR(200) NOT NULL, -- 주관기관
    category VARCHAR(100) NOT NULL,     -- R&D, 창업, 수출, 제조혁신, 인력, 마케팅 등
    industry_tags TEXT,                 -- 콤마 구분: 제조,IT,서비스,바이오
    apply_start DATE,
    apply_end DATE NOT NULL,
    budget TEXT,                        -- 총 지원규모 (원문)
    eligibility TEXT,                   -- 지원자격 (원문)
    requirements TEXT,                  -- 필요서류
    url VARCHAR(1000) NOT NULL,
    content TEXT,                       -- 공고 전문
    status VARCHAR(20) DEFAULT 'active',
    scraped_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source, source_id)
);

CREATE INDEX idx_notices_source ON grant_notices(source);
CREATE INDEX idx_notices_apply_end ON grant_notices(apply_end);
CREATE INDEX idx_notices_category ON grant_notices(category);

-- 사용자 알림 설정
CREATE TABLE alert_prefs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    categories TEXT,              -- 관심 카테고리 (콤마 구분)
    industries TEXT,              -- 관심 산업군 (콤마 구분)
    min_budget BIGINT,            -- 최소 지원금액 필터
    channel VARCHAR(50),          -- telegram, slack, email
    channel_id VARCHAR(255),      -- Telegram 채팅 ID, Slack 웹훅 URL 등
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 알림 발송 이력 (누구에게 어떤 공고를 보냈는지)
CREATE TABLE alert_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    notice_id BIGINT REFERENCES grant_notices(id),
    sent_at TIMESTAMPTZ DEFAULT now(),
    channel VARCHAR(50)
);

CREATE INDEX idx_alert_history_user ON alert_history(user_id);
