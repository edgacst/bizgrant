# bizgrant.kr — Hostinger VPS 도메인 · HTTPS

---

## 1. hPanel 방화벽 (필수)

**VPS → Security → Firewall** (또는 Managed firewall)

| 포트 | 프로토콜 | 용도 |
|------|----------|------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (인증서 발급) |
| 443 | TCP | HTTPS |

서버 안에서 `setup-server.sh` 가 ufw도 설정하지만, **hPanel 방화벽**이 막고 있으면 외부 접속이 안 됩니다. 둘 다 열어 주세요.

---

## 2. DNS 설정

### A) 도메인을 Hostinger에서 구매한 경우

hPanel → **Domains → bizgrant.kr → DNS / DNS records**

| 타입 | 이름 | 값 | TTL |
|------|------|-----|-----|
| **A** | `@` | VPS 공인 IP | 300 |
| **CNAME** | `www` | `bizgrant.kr` | 300 |

### B) 다른 업체(가비아 등)에서 구매한 경우

해당 업체 DNS 관리에서 위와 동일하게 A / CNAME 설정.

**확인:**

```bash
dig +short bizgrant.kr
```

VPS IP와 같아야 합니다.

---

## 3. HTTP 배포 확인

```bash
cd ~/bizgrant
./deploy/vps/deploy.sh
```

브라우저에서 `http://VPS_IP` 접속이 되는지 확인합니다.

---

## 4. HTTPS 적용

`.env`:

```env
DOMAIN=bizgrant.kr
CERTBOT_EMAIL=admin@bizgrant.kr
```

```bash
chmod +x deploy/vps/setup-https.sh deploy/vps/renew-https.sh
./deploy/vps/setup-https.sh
```

DNS가 아직 안 맞으면 중단됩니다. 전파 후 다시 실행하거나:

```bash
FORCE_HTTPS=1 ./deploy/vps/setup-https.sh
```

---

## 5. 인증서 자동 갱신

```bash
crontab -e
```

```cron
0 4 * * 1 /root/bizgrant/deploy/vps/renew-https.sh >> /root/bizgrant/backups/cert-renew.log 2>&1
```

경로는 실제 프로젝트 위치에 맞게 수정하세요.

---

## 문제 해결

| 증상 | 확인 |
|------|------|
| 사이트 안 열림 | hPanel 방화벽 80·443, `docker compose -f docker-compose.prod.yml ps` |
| 인증서 실패 | DNS A레코드, 80 포트 외부 접근 |
| API 오류 | `.env` `SITE_URL=https://bizgrant.kr`, backend 재시작 |
| Docker Manager 충돌 | hPanel Docker Manager와 수동 compose 동시 사용 시 포트 충돌 — **터미널 배포만** 쓰는 것을 권장 |
