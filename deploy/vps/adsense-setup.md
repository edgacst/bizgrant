# Google AdSense 설정 (bizgrant.kr)

## 1. 현재 코드 반영 사항

| 항목 | 위치 |
|------|------|
| 퍼블리셔 ID | `.env` → `VITE_ADSENSE_CLIENT=ca-pub-1209398541106079` |
| 광고 단위(선택) | `.env` → `VITE_ADSENSE_SLOT_FOOTER=슬롯번호` |
| ads.txt | `frontend/public/ads.txt` (배포 시 `https://bizgrant.kr/ads.txt`) |
| 스크립트 주입 | `frontend/vite.config.ts` (빌드 시 `<head>` 삽입) |
| 광고 노출 | 공개 페이지 푸터 위 (`PublicLayout`) — 슬롯 ID 있을 때만 |

슬롯 ID 없이 `VITE_ADSENSE_CLIENT`만 설정해도 **자동 광고(Auto ads)** 는 AdSense 콘솔에서 켜면 동작합니다.

## 2. AdSense 콘솔 등록

1. [Google AdSense](https://www.google.com/adsense/) 로그인
2. **사이트** → **사이트 추가** → `bizgrant.kr`
3. 소유 확인: 사이트 `<head>`에 이미 AdSense 스크립트가 포함됨 → **확인** 클릭
4. **ads.txt** 확인: `https://bizgrant.kr/ads.txt` 접속 가능한지 확인 (배포 후)

## 3. 디스플레이 광고 단위 (선택)

1. AdSense → **광고** → **광고 단위 기준** → **디스플레이 광고**
2. 이름 예: `bizgrant-footer`, 형식: **반응형**
3. 생성된 **광고 단위 ID**(숫자)를 `.env`에 추가:

```bash
VITE_ADSENSE_SLOT_FOOTER=1234567890
```

## 4. 서버 반영

```bash
cd ~/bizgrant
git pull origin main
# .env 에 VITE_ADSENSE_* 추가·수정 후
./deploy/vps/update.sh
```

프론트는 **재빌드**해야 env가 반영됩니다 (`update.sh`가 Docker 빌드 포함).

## 5. 승인 전·후 점검

| 확인 | 방법 |
|------|------|
| 스크립트 | 페이지 소스에 `adsbygoogle.js?client=ca-pub-...` |
| ads.txt | `curl -s https://bizgrant.kr/ads.txt` |
| 광고 단위 | 슬롯 설정 시 공개 페이지(랜딩·가이드 등) 푸터 위 |
| 개인정보 | `개인정보처리방침`에 Google AdSense·쿠키 안내 포함 |

## 6. 정책 참고

- 로그인 후 대시보드·공고 상세 등 **회원 전용 화면**에는 광고를 두지 않음
- 클릭 유도 문구·가짜 광고 배치 금지 (AdSense 정책)
- 트래픽이 적으면 승인·노출까지 수일~수주 소요될 수 있음
