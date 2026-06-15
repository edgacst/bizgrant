# bizgrant.kr 도메인 · HTTPS 설정

Oracle VM에 배포한 뒤 **도메인 연결**과 **무료 SSL(Let's Encrypt)** 을 적용하는 순서입니다.

---

## 1. Oracle 방화벽 (필수)

**Networking → Virtual Cloud Networks → Security List → Ingress Rules**

| 포트 | 프로토콜 | 소스 | 용도 |
|------|----------|------|------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (인증서 발급·리다이렉트) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

VM에서 `setup-server.sh` 는 80·443을 엽니다. `setup-https.sh` 도 443을 확인합니다.

---

## 2. DNS 설정 (도메인 등록 대행사)

Oracle VM **공인 IP**를 확인한 뒤, `bizgrant.kr` 관리 화면에서 아래처럼 설정합니다.

| 호스트 | 타입 | 값 | TTL |
|--------|------|-----|-----|
| `@` (또는 비움) | **A** | `123.45.67.89` (VM 공인 IP) | 300~3600 |
| `www` | **CNAME** | `bizgrant.kr` | 300~3600 |

또는 `www` 도 **A 레코드**로 같은 IP를 넣어도 됩니다.

**확인 (본인 PC 또는 VM):**

```bash
dig +short bizgrant.kr
dig +short www.bizgrant.kr
```

조회 IP가 VM 공인 IP와 같아야 합니다. 전파에 **수 분~24시간** 걸릴 수 있습니다.

---

## 3. 배포 (HTTP)

```bash
cd ~/bizgrant
cp .env.oracle.example .env
nano .env   # JWT_SECRET, POSTGRES_PASSWORD, PUBLIC_DATA_API_KEY, CERTBOT_EMAIL
./deploy/vps/deploy.sh
```

처음에는 `SITE_URL=http://공인IP` 로 두고 `http://공인IP` 접속이 되는지 확인합니다.

---

## 4. HTTPS 적용

`.env` 에 추가:

```env
DOMAIN=bizgrant.kr
CERTBOT_EMAIL=admin@bizgrant.kr
```

실행:

```bash
chmod +x deploy/vps/setup-https.sh deploy/vps/renew-https.sh
./deploy/vps/setup-https.sh
```

성공 시:

- `https://bizgrant.kr` 접속
- HTTP → HTTPS 자동 리다이렉트
- `.env` 의 `SITE_URL` 이 `https://bizgrant.kr` 로 갱신됨

---

## 5. 인증서 자동 갱신 (cron)

```bash
crontab -e
```

```cron
0 4 * * 1 /home/ubuntu/bizgrant/deploy/vps/renew-https.sh >> /home/ubuntu/bizgrant/backups/cert-renew.log 2>&1
```

---

## 문제 해결

| 증상 | 확인 |
|------|------|
| 인증서 발급 실패 | DNS가 VM IP를 가리키는지, 80 포트가 외부에서 열려 있는지 |
| HTTPS 접속 불가 | Oracle Security List **443** 열림 여부, `docker compose ps` |
| API 오류 | `.env` 의 `SITE_URL` 이 `https://bizgrant.kr` 인지, `backend` 재시작 |

---

## 파일

| 파일 | 설명 |
|------|------|
| `setup-https.sh` | `deploy/vps/setup-https.sh` |
| `renew-https.sh` | `deploy/vps/renew-https.sh` |
| `docker-compose.prod.https.yml` | SSL nginx 오버레이 |
| `frontend/nginx.ssl.conf.template` | HTTPS nginx 템플릿 |
