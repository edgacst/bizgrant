# BizGrant — Oracle Cloud Always Free 배포 가이드

가입자가 생길 때까지 **0원**으로 운영합니다.  
프론트(nginx) + 백엔드(Spring) + PostgreSQL을 한 VM에서 Docker로 실행합니다.

> 배포 스크립트는 `deploy/vps/` 공통입니다. Hostinger는 [deploy/hostinger/README.md](../hostinger/README.md).

---

## 빠른 체크리스트

- [ ] Oracle Cloud 가입 + ARM VM 생성
- [ ] Security List에서 **22, 80** 포트 열기
- [ ] 프로젝트 VM에 업로드
- [ ] `setup-server.sh` → 재로그인
- [ ] `.env` 설정 후 `deploy.sh`
- [ ] 브라우저에서 `SITE_URL` 접속 확인
- [ ] (선택) `backup-db.sh` cron 등록

---

## 1. Oracle Cloud 가입 (직접 진행)

1. [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) 가입
2. **리전**: `ap-seoul-1`(서울) 우선. A1 ARM 생성이 안 되면 `ap-tokyo-1` 등 시도
3. **Compute → Instances → Create instance**
   - **Image**: Ubuntu 22.04 Minimal (**aarch64**)
   - **Shape**: `VM.Standard.A1.Flex` (Always Free ARM)
   - **OCPU / Memory**: 1 OCPU, 6GB RAM
   - **Boot volume**: 50GB
   - **SSH key** 등록
4. **Networking → Virtual Cloud Networks → Security List → Ingress Rules**
   - **22** TCP (SSH), **0.0.0.0/0**
   - **80** TCP (HTTP), **0.0.0.0/0**
   - **443** TCP (HTTPS), **0.0.0.0/0** — HTTPS 사용 시
5. 인스턴스 **Public IP** 메모

> 처음에는 `http://공인IP` 로 접속합니다. **bizgrant.kr** 연결·HTTPS는 [DNS-HTTPS.md](./DNS-HTTPS.md) 참고.

---

## 2. VM 접속 및 Docker 설치

**Windows에서 업로드 (PowerShell):**

```powershell
scp -i C:\path\to\your-key.pem -r F:\bizgrant ubuntu@YOUR_PUBLIC_IP:~/bizgrant
```

**VM에서:**

```bash
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
cd ~/bizgrant
chmod +x deploy/vps/*.sh deploy/oracle/*.sh
sudo ./deploy/vps/setup-server.sh
exit
# 재로그인 (docker 그룹 적용)
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

---

## 3. 환경 변수 설정

```bash
cd ~/bizgrant
cp .env.prod.example .env
nano .env
```

| 변수 | 예시 |
|------|------|
| `SITE_URL` | `http://123.45.67.89` |
| `POSTGRES_PASSWORD` | 강한 비밀번호 |
| `JWT_SECRET` | 32자 이상 랜덤 |
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 기업마당 API 키 |

로컬 `application.yml`에 있는 API 키를 그대로 써도 됩니다.

---

## 4. 배포 실행

```bash
./deploy/vps/deploy.sh
```

- 사이트: `.env`의 `SITE_URL`
- 동기화 상태: `http://YOUR_IP/api/grants/sync/status`
- 수동 동기화: `curl -X POST http://YOUR_IP/api/grants/sync`

첫 빌드는 ARM에서 **10~20분** 걸릴 수 있습니다.

---

## 5. 운영 명령

```bash
# 로그
docker compose -f docker-compose.prod.yml logs -f backend

# 코드 수정 후 재배포
./deploy/vps/update.sh

# DB 백업
./deploy/vps/backup-db.sh

# 매일 새벽 3시 백업 (cron)
# 0 3 * * * /home/ubuntu/bizgrant/deploy/vps/backup-db.sh >> /home/ubuntu/bizgrant/backups/backup.log 2>&1
```

---

## 7. 도메인 · HTTPS (bizgrant.kr)

[DNS-HTTPS.md](./DNS-HTTPS.md) 전체 가이드.

```bash
# .env 에 DOMAIN, CERTBOT_EMAIL 설정 후
chmod +x deploy/vps/setup-https.sh deploy/vps/renew-https.sh
./deploy/vps/setup-https.sh
```

---

## 8. 리소스·비용

| 항목 | Always Free |
|------|-------------|
| VM (A1 Flex) | 계정당 4 OCPU / 24GB RAM 총량 |
| 월 비용 | **0원** (한도 내) |

동기화: **매일 03:00 (KST)** 1회 — Oracle VM 부하 최소화 (`GRANT_SYNC_CRON`으로 변경 가능).

---

## 9. 나중에 (가입자·유료 전환 시)

1. SMTP (`MAIL_*`) — 뉴스레터·알림 메일
2. API 인증 강화
3. Hostinger 등 유료 VPS 이전 검토

---

## 파일 구조

```
bizgrant/
├── docker-compose.prod.yml
├── docker-compose.prod.https.yml
├── .env.prod.example
└── deploy/
    ├── vps/              ← 배포 스크립트 (공통)
    ├── hostinger/
    └── oracle/
        ├── README.md
        └── DNS-HTTPS.md
```
