-- BizGrant Database Schema
-- PostgreSQL 16 / Port 5433 / User: postgres / Pass: bizgrant2026!

-- ===== 1. Users =====
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER'
                    CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    oauth_provider  VARCHAR(20) CHECK (oauth_provider IN ('GOOGLE', 'NAVER', 'KAKAO')),
    oauth_id        VARCHAR(255),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 2. User Profiles =====
CREATE TABLE IF NOT EXISTS user_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(200) NOT NULL,
    biz_number      VARCHAR(20),
    industry        VARCHAR(50) NOT NULL,
    sub_industry    VARCHAR(50),
    company_size    VARCHAR(20) NOT NULL,
    region          VARCHAR(50) NOT NULL DEFAULT '전국',
    founded_year    INT,
    revenue_range   VARCHAR(30),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 3. User Settings =====
CREATE TABLE IF NOT EXISTS user_settings (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notify_email    BOOLEAN NOT NULL DEFAULT TRUE,
    notify_telegram BOOLEAN NOT NULL DEFAULT FALSE,
    notify_slack    BOOLEAN NOT NULL DEFAULT FALSE,
    telegram_chat_id VARCHAR(100),
    slack_webhook   VARCHAR(255),
    theme           VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language        VARCHAR(10) NOT NULL DEFAULT 'ko',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 4. Organizations =====
CREATE TABLE IF NOT EXISTS organizations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(50),
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('GOVERNMENT', 'LOCAL_GOV', 'PUBLIC_INSTITUTION', 'ASSOCIATION', 'PRIVATE')),
    website         VARCHAR(255),
    logo_url        VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 5. Categories =====
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(50) NOT NULL,
    display_order   INT NOT NULL DEFAULT 0,
    icon            VARCHAR(50),
    color_hex       VARCHAR(7),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- ===== 6. Grants =====
CREATE TABLE IF NOT EXISTS grants (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    category_id     INT NOT NULL REFERENCES categories(id),
    apply_start     DATE NOT NULL,
    apply_end       DATE NOT NULL,
    budget          VARCHAR(200),
    budget_amount   BIGINT,
    budget_type     VARCHAR(20)
                    CHECK (budget_type IN ('GRANT', 'LOAN', 'INVESTMENT', 'TAX_CREDIT', 'OTHER')),
    target_industry VARCHAR(100),
    target_size     VARCHAR(50),
    target_region   VARCHAR(100),
    content         TEXT,
    eligibility     TEXT,
    requirements    TEXT,
    original_url    VARCHAR(500),
    source_site     VARCHAR(50) NOT NULL DEFAULT 'BIZINFO'
                    CHECK (source_site IN ('BIZINFO', 'KOTRA', 'SMBA', 'LOCAL_GOV', 'MANUAL')),
    source_id       VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'CLOSED', 'UPCOMING', 'ARCHIVED')),
    scraped_at      TIMESTAMPTZ,
    view_count      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 7. Grant Documents =====
CREATE TABLE IF NOT EXISTS grant_documents (
    id              BIGSERIAL PRIMARY KEY,
    grant_id        BIGINT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('APPLICATION', 'BUSINESS_PLAN', 'FINANCIAL', 'TAX', 'CERTIFICATE', 'OTHER')),
    description     VARCHAR(300) NOT NULL,
    required        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0
);

-- ===== 8. Pipeline Items =====
CREATE TABLE IF NOT EXISTS pipeline_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grant_id        BIGINT NOT NULL,
    stage           VARCHAR(20) NOT NULL DEFAULT 'DISCOVERED'
                    CHECK (stage IN ('DISCOVERED','REVIEWING','PREPARING','SUBMITTED','WAITING','SELECTED','REJECTED')),
    notes           TEXT,
    documents       JSONB DEFAULT '[]',
    expected_budget VARCHAR(100),
    submitted_at    TIMESTAMPTZ,
    result_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, grant_id)
);

-- ===== 9. Bookmarks =====
CREATE TABLE IF NOT EXISTS bookmarks (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grant_id        BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, grant_id)
);

-- ===== 10. Alert Configs =====
CREATE TABLE IF NOT EXISTS alert_configs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100),
    categories      JSONB NOT NULL DEFAULT '[]',
    industries      JSONB NOT NULL DEFAULT '[]',
    regions         JSONB NOT NULL DEFAULT '["전국"]',
    min_budget      BIGINT,
    keyword         VARCHAR(200),
    alert_before_days INT NOT NULL DEFAULT 7,
    alert_method    JSONB NOT NULL DEFAULT '["email"]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 11. Subscriptions =====
CREATE TABLE IF NOT EXISTS subscriptions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan            VARCHAR(20) NOT NULL CHECK (plan IN ('FREE', 'PRO', 'ENTERPRISE')),
    billing_cycle   VARCHAR(10) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'YEARLY')),
    status          VARCHAR(20) NOT NULL DEFAULT 'TRIAL'
                    CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED')),
    trial_end_at    TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    canceled_at     TIMESTAMPTZ,
    payment_method  VARCHAR(20),
    payment_gateway VARCHAR(30),
    gateway_subscription_id VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 12. Audit Logs =====
CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(30),
    entity_id       BIGINT,
    details         JSONB,
    ip_address      INET,
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== 13. Scraping Logs =====
CREATE TABLE IF NOT EXISTS scraping_logs (
    id              BIGSERIAL PRIMARY KEY,
    source_site     VARCHAR(50) NOT NULL,
    started_at      TIMESTAMPTZ NOT NULL,
    finished_at     TIMESTAMPTZ,
    total_found     INT DEFAULT 0,
    new_grants      INT DEFAULT 0,
    updated_grants  INT DEFAULT 0,
    errors          JSONB,
    status          VARCHAR(20) NOT NULL DEFAULT 'RUNNING'
                    CHECK (status IN ('RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON user_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_profiles_size ON user_profiles(company_size);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON user_profiles(region);
CREATE INDEX IF NOT EXISTS idx_orgs_type ON organizations(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_grants_apply ON grants(apply_start, apply_end);
CREATE INDEX IF NOT EXISTS idx_grants_category ON grants(category_id);
CREATE INDEX IF NOT EXISTS idx_grants_org ON grants(organization_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON grants(status);
CREATE INDEX IF NOT EXISTS idx_grants_industry ON grants(target_industry);
CREATE INDEX IF NOT EXISTS idx_grants_budget_amt ON grants(budget_amount) WHERE budget_amount IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grants_urgent ON grants(apply_end) WHERE status = 'ACTIVE' AND apply_end >= CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_docs_grant ON grant_documents(grant_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_user ON pipeline_items(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON pipeline_items(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alert_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_source ON scraping_logs(source_site);
CREATE INDEX IF NOT EXISTS idx_scraping_time ON scraping_logs(started_at DESC);

-- ===== SEED: Categories =====
INSERT INTO categories (code, name, display_order, color_hex) VALUES
('RD', 'R&D', 1, '#7C3AED'),
('STARTUP', '창업', 2, '#059669'),
('EXPORT', '수출', 3, '#2563EB'),
('MANUFACTURING', '제조혁신', 4, '#EA580C'),
('HR', '인력', 5, '#DB2777'),
('MARKETING', '마케팅', 6, '#0D9488'),
('OTHER', '기타', 7, '#6B7280')
ON CONFLICT (code) DO NOTHING;

-- ===== SEED: Organizations =====
INSERT INTO organizations (name, short_name, type) VALUES
('중소벤처기업부', '중기부', 'GOVERNMENT'),
('한국무역협회', 'KITA', 'ASSOCIATION'),
('서울경제진흥원', 'SBA', 'PUBLIC_INSTITUTION'),
('KOTRA', 'KOTRA', 'PUBLIC_INSTITUTION'),
('중소기업진흥공단', '중진공', 'PUBLIC_INSTITUTION'),
('창업진흥원', '창진원', 'PUBLIC_INSTITUTION'),
('한국콘텐츠진흥원', 'KOCCA', 'PUBLIC_INSTITUTION'),
('한국산업기술진흥원', 'KIAT', 'PUBLIC_INSTITUTION'),
('정보통신산업진흥원', 'NIPA', 'PUBLIC_INSTITUTION'),
('고용노동부', '고용부', 'GOVERNMENT'),
('부천시', '부천시', 'LOCAL_GOV'),
('경기도', '경기도', 'LOCAL_GOV')
ON CONFLICT (name) DO NOTHING;

-- ===== SEED: Demo User =====
INSERT INTO users (id, email, password_hash, name, role) VALUES
(1, 'demo@bizgrant.kr', '$2a$10$demo_hash_placeholder', '홍길동', 'USER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (user_id, company_name, industry, company_size, region) VALUES
(1, '(주)테크스타트', 'IT/소프트웨어', '10인 미만', '경기')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO user_settings (user_id) VALUES (1) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subscriptions (user_id, plan, status) VALUES
(1, 'FREE', 'TRIAL')
ON CONFLICT DO NOTHING;
