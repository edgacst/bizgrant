# 🗄️ BizGrant 데이터베이스 설계서

> **DBMS**: PostgreSQL 16  
> **ORM**: Spring Data JPA (Hibernate)  
> **마이그레이션**: Flyway  
> **캐시**: Redis

---

## 📐 ERD (엔티티 관계도)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   users      │1─────*│  user_profiles   │       │  categories  │
│              │       └──────────────────┘       │              │
│  id (PK)     │                                   │  id (PK)     │
│  email       │1─────*┌──────────────────┐       │  name        │
│  password    │       │ user_settings    │       │  code        │
│  name        │       └──────────────────┘       └──────┬───────┘
│  role        │1─────*┌──────────────────┐              │
│  status      │       │  subscriptions   │              │
│  created_at  │       └──────────────────┘       ┌──────┴───────┐
└──────┬───────┘                                  │    grants    │
       │                                          │              │
       │1─────*┌──────────────────┐              │  id (PK)     │
       │       │  pipeline_items  │              │  title       │
       │       └──────────────────┘              │  org_id (FK) │
       │                                         │  category_id │
       │1─────*┌──────────────────┐              │  apply_start │
       │       │    bookmarks     │              │  apply_end   │
       │       └──────────────────┘              │  budget      │
       │                                         │  status      │
       │1─────*┌──────────────────┐              │  created_at  │
       │       │   alert_configs  │              └──────┬───────┘
       │       └──────────────────┘                     │
       │                                         ┌──────┴───────┐
       │1─────*┌──────────────────┐              │ organizations│
       │       │   audit_logs     │              │              │
       │       └──────────────────┘              │  id (PK)     │
       │                                         │  name        │
       │1─────1┌──────────────────┐              │  type        │
               │  user_profiles   │              └──────────────┘
               └──────────────────┘

       ┌──────────────────┐      ┌──────────────────┐
       │    grant_tags    │      │ grant_grant_tags │
       │  id (PK)         │1──*│  grant_id (FK)   │
       │  name            │      │  tag_id (FK)     │
       └──────────────────┘      └──────────────────┘

       ┌──────────────────┐
       │ grant_documents  │
       │  id (PK)         │
       │  grant_id (FK)   │
       │  type            │
       │  description     │
       │  required        │
       └──────────────────┘
```

---

## 📋 테이블 스키마

### 1. users — 회원

```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER'
                    CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED')),
    oauth_provider  VARCHAR(20) CHECK (oauth_provider IN ('GOOGLE', 'NAVER', 'KAKAO', NULL)),
    oauth_id        VARCHAR(255),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE oauth_provider IS NOT NULL;
```

---

### 2. user_profiles — 회원 프로필 (매칭용)

```sql
CREATE TABLE user_profiles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(200) NOT NULL,
    biz_number      VARCHAR(20),
    industry        VARCHAR(50) NOT NULL,        -- IT/소프트웨어, 제조/하드웨어, ...
    sub_industry    VARCHAR(50),                 -- 세부 업종
    company_size    VARCHAR(20) NOT NULL,        -- 개인/1인, 10인 미만, ...
    region          VARCHAR(50) NOT NULL DEFAULT '전국',
    founded_year    INT,
    revenue_range   VARCHAR(30),                 -- 1억 미만, 1~10억, ...
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_profiles_industry ON user_profiles(industry);
CREATE INDEX idx_profiles_size ON user_profiles(company_size);
CREATE INDEX idx_profiles_region ON user_profiles(region);
```

---

### 3. user_settings — 회원 설정

```sql
CREATE TABLE user_settings (
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
```

---

### 4. organizations — 지원 기관

```sql
CREATE TABLE organizations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    short_name      VARCHAR(50),
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('GOVERNMENT', 'LOCAL_GOV', 'PUBLIC_INSTITUTION', 'ASSOCIATION', 'PRIVATE')),
    website         VARCHAR(255),
    logo_url        VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orgs_type ON organizations(type);
CREATE UNIQUE INDEX idx_orgs_name ON organizations(name);
```

---

### 5. categories — 공고 카테고리

```sql
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(30) NOT NULL UNIQUE,  -- RD, STARTUP, EXPORT, ...
    name            VARCHAR(50) NOT NULL,          -- R&D, 창업, 수출, ...
    display_order   INT NOT NULL DEFAULT 0,
    icon            VARCHAR(50),
    color_hex       VARCHAR(7),                   -- #7C3AED
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

### 6. grants — 공고 (핵심 테이블)

```sql
CREATE TABLE grants (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    category_id     INT NOT NULL REFERENCES categories(id),
    apply_start     DATE NOT NULL,
    apply_end       DATE NOT NULL,
    budget          VARCHAR(200),                 -- "최대 1억원", "총 500억원"
    budget_amount   BIGINT,                        -- 정규화된 숫자 (원 단위)
    budget_type     VARCHAR(20)                    -- 보조금, 융자, 출연, ...
                    CHECK (budget_type IN ('GRANT', 'LOAN', 'INVESTMENT', 'TAX_CREDIT', 'OTHER')),
    target_industry VARCHAR(100),                  -- 대상 업종
    target_size     VARCHAR(50),                   -- 대상 기업 규모
    target_region   VARCHAR(100),                  -- 대상 지역
    content         TEXT,                          -- 사업 개요 (상세)
    eligibility     TEXT,                          -- 지원 자격
    requirements    TEXT,                          -- 필요 서류 요약
    original_url    VARCHAR(500),                  -- 원문 링크
    source_site     VARCHAR(50) NOT NULL DEFAULT 'BIZINFO',
                    CHECK (source_site IN ('BIZINFO', 'KOTRA', 'SMBA', 'LOCAL_GOV', 'MANUAL')),
    source_id       VARCHAR(100),                  -- 원본 사이트의 공고 ID
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'CLOSED', 'UPCOMING', 'ARCHIVED')),
    scraped_at      TIMESTAMPTZ,
    view_count      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 핵심 인덱스
CREATE INDEX idx_grants_apply       ON grants(apply_start, apply_end);
CREATE INDEX idx_grants_category    ON grants(category_id);
CREATE INDEX idx_grants_org         ON grants(organization_id);
CREATE INDEX idx_grants_status      ON grants(status);
CREATE INDEX idx_grants_industry    ON grants(target_industry);
CREATE INDEX idx_grants_budget_amt  ON grants(budget_amount) WHERE budget_amount IS NOT NULL;

-- 전문 검색 (한글)
CREATE INDEX idx_grants_title_gin   ON grants USING gin(to_tsvector('korean', title));
CREATE INDEX idx_grants_content_gin ON grants USING gin(to_tsvector('korean', coalesce(content, '')));

-- 마감 임박 공고 빠른 조회
CREATE INDEX idx_grants_urgent ON grants(apply_end)
    WHERE status = 'ACTIVE' AND apply_end >= CURRENT_DATE;
```

---

### 7. grant_documents — 필요 서류

```sql
CREATE TABLE grant_documents (
    id              BIGSERIAL PRIMARY KEY,
    grant_id        BIGINT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN ('APPLICATION', 'BUSINESS_PLAN', 'FINANCIAL', 'TAX', 'CERTIFICATE', 'OTHER')),
    description     VARCHAR(300) NOT NULL,
    required        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_docs_grant ON grant_documents(grant_id);
```

---

### 8. grant_tags — 공고 태그

```sql
CREATE TABLE grant_tags (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE grant_grant_tags (
    grant_id        BIGINT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    tag_id          INT NOT NULL REFERENCES grant_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (grant_id, tag_id)
);
```

---

### 9. pipeline_items — 지원 파이프라인

```sql
CREATE TABLE pipeline_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grant_id        BIGINT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    stage           VARCHAR(20) NOT NULL DEFAULT 'DISCOVERED'
                    CHECK (stage IN (
                        'DISCOVERED', 'REVIEWING', 'PREPARING',
                        'SUBMITTED', 'WAITING', 'SELECTED', 'REJECTED'
                    )),
    notes           TEXT,
    documents       JSONB DEFAULT '[]',  -- 제출 서류 체크리스트
    expected_budget VARCHAR(100),
    submitted_at    TIMESTAMPTZ,
    result_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, grant_id)
);

CREATE INDEX idx_pipeline_user   ON pipeline_items(user_id);
CREATE INDEX idx_pipeline_stage  ON pipeline_items(user_id, stage);
CREATE INDEX idx_pipeline_urgent ON pipeline_items(user_id, stage)
    WHERE stage IN ('DISCOVERED', 'REVIEWING', 'PREPARING');
```

---

### 10. bookmarks — 북마크

```sql
CREATE TABLE bookmarks (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grant_id        BIGINT NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, grant_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
```

---

### 11. alert_configs — 알림 설정

```sql
CREATE TABLE alert_configs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100),
    categories      JSONB NOT NULL DEFAULT '[]',     -- 관심 카테고리
    industries      JSONB NOT NULL DEFAULT '[]',     -- 관심 업종
    regions         JSONB NOT NULL DEFAULT '["전국"]',
    min_budget      BIGINT,
    keyword         VARCHAR(200),                    -- 키워드 알림
    alert_before_days INT NOT NULL DEFAULT 7,       -- 마감 며칠 전
    alert_method    JSONB NOT NULL DEFAULT '["email"]', -- email, telegram, slack
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user ON alert_configs(user_id);
```

---

### 12. subscriptions — 구독/결제

```sql
CREATE TABLE subscriptions (
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
    payment_method  VARCHAR(20),          -- CARD, BANK_TRANSFER, ...
    payment_gateway VARCHAR(30),          -- TOSS, KAKAOPAY, NICE, ...
    gateway_subscription_id VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subs_user   ON subscriptions(user_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
```

---

### 13. audit_logs — 감사 로그

```sql
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,      -- LOGIN, VIEW_GRANT, ADD_PIPELINE, EXPORT, ...
    entity_type     VARCHAR(30),               -- GRANT, PIPELINE, BOOKMARK, ...
    entity_id       BIGINT,
    details         JSONB,
    ip_address      INET,
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_time   ON audit_logs(created_at DESC);
```

---

### 14. scraping_logs — 크롤링 로그

```sql
CREATE TABLE scraping_logs (
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

CREATE INDEX idx_scraping_source ON scraping_logs(source_site);
CREATE INDEX idx_scraping_time   ON scraping_logs(started_at DESC);
```

---

## ⚡ 인덱스 전략 요약

| 우선순위 | 인덱스 | 이유 |
|:---:|--------|------|
| 🔴 | `grants(apply_end)` + 조건부 인덱스 | 마감 임박 공고 쿼리 (가장 빈번) |
| 🔴 | `pipeline_items(user_id, stage)` | Kanban 보드 조회 |
| 🟡 | `grants(category_id)` | 카테고리 필터 |
| 🟡 | `users(email)` | 로그인 |
| 🟡 | `grants` GIN 트라이그램 (`title`) | 한글 전문 검색 |
| 🟢 | `bookmarks(user_id)` | 북마크 목록 |
| 🟢 | `alert_configs(user_id)` | 알림 설정 |
| 🟢 | `audit_logs(created_at DESC)` | 로그 조회 |

---

## 🔄 Flyway 마이그레이션 순서

```
V1__init_users.sql           # users, user_profiles, user_settings
V2__init_grant_core.sql      # organizations, categories, grants, grant_documents
V3__init_tags.sql            # grant_tags, grant_grant_tags
V4__init_pipeline.sql        # pipeline_items
V5__init_bookmarks.sql       # bookmarks
V6__init_alerts.sql          # alert_configs
V7__init_subscriptions.sql   # subscriptions
V8__init_audit.sql           # audit_logs, scraping_logs
V9__seed_categories.sql      # 카테고리 초기 데이터
V10__seed_organizations.sql  # 기관 초기 데이터
V11__seed_grants.sql         # 42개 공고 시드
V12__fulltext_index.sql      # GIN 인덱스 (korean 텍스트 검색)
```

---

## 📦 PostgreSQL 한글 전문 검색 설정

```sql
-- 한국어 텍스트 검색 설정
CREATE TEXT SEARCH CONFIGURATION korean (COPY = simple);

-- 형태소 분석기 없이 기본 설정 (mecab 설치 시 교체)
ALTER TEXT SEARCH CONFIGURATION korean
    ALTER MAPPING FOR hword, hword_part, word
    WITH simple;
```

---

## 💰 예상 데이터 규모

| 테이블 | 1년 후 | 3년 후 |
|--------|--------|--------|
| users | ~5만 | ~20만 |
| grants | ~5천 | ~2만 (누적) |
| pipeline_items | ~10만 | ~50만 |
| bookmarks | ~20만 | ~100만 |
| audit_logs | ~500만 | ~2천만 (파티셔닝 필요) |

> ⚠️ `audit_logs`는 월 단위 파티셔닝 권장
