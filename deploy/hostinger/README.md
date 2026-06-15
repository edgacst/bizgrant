# BizGrant — Hostinger VPS 배포 가이드

Spring Boot + PostgreSQL + React를 **Hostinger KVM VPS** 한 대에서 Docker로 실행합니다.

> **주의:** 웹 호스팅(공유 호스팅)은 PHP용이라 **안 됩니다.** 반드시 **VPS** 플랜을 선택하세요.

---

## 추천 플랜

| 플랜 | 스펙 | BizGrant |
|------|------|----------|
| **KVM 1** | 1 vCPU, 4GB RAM, 50GB | 초기 운영 가능 (권장 최소) |
| **KVM 2** | 2 vCPU, 8GB RAM, 100GB | 여유 있음 (추천) |

- OS: **Ubuntu 22.04** 또는 **24.04**
- 앱 카탈로그에서 **Docker** 템플릿 선택하면 설치가 빠릅니다
- 데이터센터: 한국 사용자면 **싱가포르** 또는 가까운 아시아 리전

월 비용은 프로모션·환율에 따라 다르니 [Hostinger VPS](https://www.hostinger.com/vps-hosting)에서 확인하세요.

---

## 빠른 체크리스트

- [ ] Hostinger VPS 구매 + Ubuntu + Docker
- [ ] hPanel 방화벽에서 **22, 80, 443** 허용
- [ ] 프로젝트 업로드 (`git clone` 또는 `scp`)
- [ ] `setup-server.sh` → 재로그인
- [ ] `.env` 설정 후 `deploy.sh`
- [ ] `http://공인IP` 접속 확인
- [ ] bizgrant.kr DNS + `setup-https.sh`

---

## 1. VPS 만들기

1. [Hostinger](https://www.hostinger.com) 가입
2. **VPS** → **KVM 1** 이상 선택
3. **OS / 앱**: `Ubuntu 24.04 with Docker` (또는 Ubuntu 22.04 + 나중에 Docker 설치)
4. root 비밀번호 설정, **공인 IP** 메모
5. **hPanel → VPS → Security → Firewall**
   - TCP **22** (SSH)
   - TCP **80** (HTTP)
   - TCP **443** (HTTPS)

---

## 2. 서버 접속

Hostinger hPanel **Browser terminal** 또는 로컬 SSH:

```bash
ssh root@YOUR_VPS_IP
```

프로젝트 받기:

```bash
apt-get update && apt-get install -y git
cd ~
git clone https://github.com/edgacst/bizgrant.git
cd bizgrant
```

Windows에서 직접 올리려면 (PowerShell):

```powershell
scp -r F:\bizgrant root@YOUR_VPS_IP:~/bizgrant
```

---

## 3. Docker 환경 준비

Docker 템플릿을 쓰지 않았다면:

```bash
cd ~/bizgrant
chmod +x deploy/vps/*.sh
./deploy/vps/setup-server.sh
```

`root`로 로그인했으면 재로그인 없이 바로 다음 단계로 가도 됩니다.  
`ubuntu` 등 일반 사용자면 **한 번 재로그인** 후 `docker` 명령을 씁니다.

---

## 4. 환경 변수

```bash
cp .env.prod.example .env
nano .env
```

| 변수 | 예시 |
|------|------|
| `SITE_URL` | `http://123.45.67.89` (VPS 공인 IP) |
| `POSTGRES_PASSWORD` | 강한 비밀번호 |
| `JWT_SECRET` | 32자 이상 랜덤 |
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 기업마당 API 키 |
| `DOMAIN` | `bizgrant.kr` (HTTPS 전) |
| `CERTBOT_EMAIL` | 인증서 알림용 이메일 |

---

## 5. 배포

```bash
./deploy/vps/deploy.sh
```

- 사이트: `.env`의 `SITE_URL`
- 동기화: `curl -X POST http://YOUR_IP/api/grants/sync`

첫 빌드는 **5~15분** 걸릴 수 있습니다.

---

## 6. 도메인 · HTTPS (bizgrant.kr)

도메인을 Hostinger에서 샀다면 hPanel **DNS / Nameservers**에서 설정이 쉽습니다.  
자세한 단계는 [DNS-HTTPS.md](./DNS-HTTPS.md).

```bash
./deploy/vps/setup-https.sh
```

성공 시 `https://bizgrant.kr` 로 접속됩니다.

---

## 7. 운영

```bash
# 코드 수정 후 서버 반영
git pull origin main
./deploy/vps/update.sh

# 공고 데이터 동기화 (0건일 때)
./deploy/vps/sync-grants.sh

# 로그
docker compose -f docker-compose.prod.yml logs -f backend

# 코드 반영
git pull origin main
./deploy/vps/update.sh

# DB 백업
./deploy/vps/backup-db.sh

# 인증서 갱신 (cron, 매주)
# 0 4 * * 1 /root/bizgrant/deploy/vps/renew-https.sh >> /root/bizgrant/backups/cert-renew.log 2>&1
```

Hostinger는 **주간 VPS 백업**이 포함된 플랜이 많습니다. hPanel에서 활성화해 두세요.

---

## 공유 호스팅 vs VPS

| | 웹 호스팅 | KVM VPS |
|--|-----------|---------|
| Spring Boot + PostgreSQL | 불가 | **가능** |
| Docker Compose | 불가 | **가능** |
| 월 비용 | 저렴 | KVM 1부터 |

BizGrant는 **반드시 VPS**입니다.

---

## 파일

```
bizgrant/
├── docker-compose.prod.yml
├── docker-compose.prod.https.yml
├── .env.prod.example
└── deploy/
    ├── vps/          ← 배포 스크립트 (공통)
    └── hostinger/    ← 이 가이드
```

문제가 있으면 hPanel **Kodee AI** 또는 Hostinger 지원에 방화벽·포트 개방 여부를 먼저 확인하세요.
