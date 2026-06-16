# bizgrant.kr 검색엔진 사이트 등록

공개 페이지(랜딩·소개·가이드·캘린더·약관)만 색인합니다. 공고·대시보드는 로그인 필요(`robots.txt` 차단).

## 1. 배포 전 확인

```bash
cd ~/bizgrant
git pull origin main
./deploy/vps/update.sh
./deploy/vps/verify-seo.sh
```

정상이면:

- `https://bizgrant.kr/robots.txt` — Sitemap URL 포함
- `https://bizgrant.kr/sitemap.xml` — XML 목록 (200 OK)

## 2. Google Search Console

Google은 **도메인 속성**(`bizgrant.kr`)을 만들 때 DNS **TXT** 확인을 권장합니다.  
`www`·`http`·`https` 전체를 한 번에 다룰 때 유리합니다.

### A) DNS TXT (권장 — 도메인 속성)

1. [Google Search Console](https://search.google.com/search-console) → **속성 추가** → **도메인** → `bizgrant.kr`
2. 표시되는 TXT 값 복사 (형식: `google-site-verification=xxxxxxxx`)
3. **Hostinger hPanel** → **Domains → bizgrant.kr → DNS / DNS records** → **Add record**

| 타입 | 이름(Name) | 값(Value) | TTL |
|------|------------|-----------|-----|
| **TXT** | `@` (또는 비움) | `google-site-verification=JrLpEdN28bDRxTDNh4-Wqs_8tRWmpvgAzmAOsgOoGsw` | 300 |

4. 저장 후 전파 대기 (보통 **5분~2시간**, 최대 48시간)
5. Search Console에서 **확인** (실패 시 몇 시간 뒤 재시도)
6. **Sitemaps** → `https://bizgrant.kr/sitemap.xml` 제출

**확인 명령 (서버·PC):**

```bash
dig +short TXT bizgrant.kr
# 또는
nslookup -type=TXT bizgrant.kr
```

출력에 `google-site-verification=JrLpEdN28bDRxTDNh4-Wqs_8tRWmpvgAzmAOsgOoGsw` 가 보여야 합니다.

> 다른 업체(가비아 등)에서 도메인을 샀다면 그 업체 DNS 관리 화면에 동일하게 TXT 추가.

### B) HTML 태그 (URL 접두어 속성 — 이미 사이트에 반영됨)

1. 속성 추가 → **URL 접두어** → `https://bizgrant.kr`
2. **HTML 태그** 방식 → **확인** (메타 태그는 `frontend/index.html`에 이미 있음)

DNS TXT와 HTML 태그는 **서로 다른 속성**입니다. 둘 다 등록해도 됩니다.

### C) 소유 확인 후

1. **Sitemaps** → `https://bizgrant.kr/sitemap.xml` 제출
2. **URL 검사** → `https://bizgrant.kr/` 색인 요청

## 3. 네이버 서치어드바이저

1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) 로그인
2. **웹마스터 도구** → **사이트 등록** → `https://bizgrant.kr`
3. **HTML 태그** 확인 방식 → `content` 값 복사
4. `.env`에 추가:

```bash
VITE_NAVER_SITE_VERIFICATION=여기에_코드_붙여넣기
```

5. 위와 같이 `frontend` 재빌드 후 네이버에서 **확인**
6. **요청** → **사이트맵 제출** → `https://bizgrant.kr/sitemap.xml`
7. **웹 페이지 수집 요청** → `https://bizgrant.kr/` 입력

## 4. (선택) Bing Webmaster

1. [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Google Search Console에서 가져오기 가능, 또는 HTML 메타 태그로 `VITE_BING_SITE_VERIFICATION` 설정

## 5. HTML 파일 방식 (메타 태그 대신)

검색엔진이 `googlexxxx.html` 같은 파일을 요구하면:

1. 파일을 `frontend/public/` 에 넣기
2. `git add` → push → 서버 `update.sh`

nginx가 정적 파일로 바로 제공합니다.

## 6. 등록 후 점검 (1~2주)

| 항목 | 확인 |
|------|------|
| 색인 페이지 수 | Search Console · 서치어드바이저 |
| 크롤링 오류 | 404·5xx 없는지 |
| `site:bizgrant.kr` | 구글 검색 결과 노출 여부 |

## 참고

- `www.bizgrant.kr`도 쓰면 Search Console에 **별도 속성**으로 추가하거나 도메인 속성 사용
- HTTPS·`SITE_URL=https://bizgrant.kr` 이 `.env`에 맞는지 확인
