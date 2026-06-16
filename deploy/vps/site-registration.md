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

1. [Google Search Console](https://search.google.com/search-console) 접속
2. **속성 추가** → **URL 접두어** → `https://bizgrant.kr`
3. 소유권 확인 → **HTML 태그** 방식 선택
4. `content="..."` 안의 **코드만** 복사
5. 서버 `.env`에 추가:

```bash
VITE_GOOGLE_SITE_VERIFICATION=여기에_코드_붙여넣기
```

6. 프론트 재빌드:

```bash
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

7. Search Console에서 **확인** 클릭
8. **Sitemaps** → `https://bizgrant.kr/sitemap.xml` 제출
9. **URL 검사** → `https://bizgrant.kr/` 색인 요청

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
