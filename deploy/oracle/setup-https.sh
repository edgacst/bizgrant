#!/usr/bin/env bash
# bizgrant.kr 등 도메인 + Let's Encrypt HTTPS 설정
# 사전 조건: deploy.sh 완료, DNS A레코드가 이 서버 공인 IP를 가리킴
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다. cp .env.oracle.example .env 후 설정하세요."
  exit 1
fi

# shellcheck disable=SC1091
set -a
source .env
set +a

DOMAIN="${DOMAIN:-bizgrant.kr}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
SITE_URL="${SITE_URL:-https://${DOMAIN}}"

if [[ -z "$CERTBOT_EMAIL" ]]; then
  echo "오류: .env 에 CERTBOT_EMAIL=your@email.com 을 설정하세요."
  exit 1
fi

COMPOSE=(docker compose -f docker-compose.oracle.yml -f docker-compose.oracle.https.yml --env-file .env)
GEN_DIR="$ROOT/deploy/oracle/generated"
SSL_CONF="$GEN_DIR/nginx.ssl.conf"
TEMPLATE="$ROOT/frontend/nginx.ssl.conf.template"

mkdir -p "$GEN_DIR"
sed "s/__DOMAIN__/${DOMAIN}/g" "$TEMPLATE" > "$SSL_CONF"

echo "==> 방화벽 443 허용"
if command -v ufw &>/dev/null; then
  sudo ufw allow 443/tcp || true
fi

echo "==> DNS 확인 (${DOMAIN} → 이 서버 공인 IP)"
PUBLIC_IP="$(curl -sf https://ifconfig.me || curl -sf https://api.ipify.org || true)"
RESOLVED_IP="$(getent ahosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
if [[ -n "$PUBLIC_IP" && -n "$RESOLVED_IP" && "$PUBLIC_IP" != "$RESOLVED_IP" ]]; then
  echo "경고: DNS가 아직 이 서버를 가리키지 않을 수 있습니다."
  echo "  서버 공인 IP: ${PUBLIC_IP}"
  echo "  ${DOMAIN} 조회 IP: ${RESOLVED_IP}"
  if [[ "${FORCE_HTTPS:-}" != "1" ]]; then
    echo "  DNS 전파 후 다시 실행하세요. 강제 실행: FORCE_HTTPS=1 ./deploy/oracle/setup-https.sh"
    exit 1
  fi
  echo "  FORCE_HTTPS=1 — 계속 진행합니다."
fi

echo "==> 웹 서버 기동 (HTTP, ACME 경로)"
docker compose -f docker-compose.oracle.yml --env-file .env up -d frontend

echo "==> Let's Encrypt 인증서 발급 (${DOMAIN}, www.${DOMAIN})"
docker compose -f docker-compose.oracle.yml --env-file .env --profile tools run --rm certbot \
  certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos --no-eff-email \
  --non-interactive

echo "==> HTTPS nginx 설정 적용 및 재기동"
"${COMPOSE[@]}" up -d frontend

# SITE_URL 갱신
if grep -q '^SITE_URL=' .env; then
  if [[ "$(uname)" == Darwin ]]; then
    sed -i '' "s|^SITE_URL=.*|SITE_URL=https://${DOMAIN}|" .env
  else
    sed -i "s|^SITE_URL=.*|SITE_URL=https://${DOMAIN}|" .env
  fi
else
  echo "SITE_URL=https://${DOMAIN}" >> .env
fi

echo "==> 백엔드 SITE_URL 반영을 위해 API 재시작"
docker compose -f docker-compose.oracle.yml --env-file .env up -d backend

echo ""
echo "HTTPS 설정 완료."
echo "  사이트: https://${DOMAIN}"
echo "  인증서 갱신: ./deploy/oracle/renew-https.sh (cron 등록 권장)"
echo ""
echo "Oracle Cloud 콘솔에서도 Ingress 443/TCP 를 열었는지 확인하세요."
