#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다. cp .env.prod.example .env 후 설정하세요."
  exit 1
fi

# shellcheck disable=SC1091
get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env | tail -1 || true)"
  line="${line#*=}"
  line="${line%\"}"
  line="${line#\"}"
  echo "$line"
}

DOMAIN="$(get_env DOMAIN)"
DOMAIN="${DOMAIN:-bizgrant.kr}"
CERTBOT_EMAIL="$(get_env CERTBOT_EMAIL)"

if [[ -z "$CERTBOT_EMAIL" ]]; then
  echo "오류: .env 에 CERTBOT_EMAIL=your@email.com 을 설정하세요."
  exit 1
fi

COMPOSE_BASE=(docker compose -f docker-compose.prod.yml --env-file .env)
COMPOSE_HTTPS=(docker compose -f docker-compose.prod.yml -f docker-compose.prod.https.yml --env-file .env)
GEN_DIR="$ROOT/deploy/vps/generated"
SSL_CONF="$GEN_DIR/nginx.ssl.conf"
TEMPLATE="$ROOT/frontend/nginx.ssl.conf.template"

mkdir -p "$GEN_DIR"
sed "s/__DOMAIN__/${DOMAIN}/g" "$TEMPLATE" > "$SSL_CONF"

echo "==> 방화벽 443 허용"
if command -v ufw &>/dev/null; then
  ufw allow 443/tcp || true
fi

echo "==> DNS 확인 (${DOMAIN})"
PUBLIC_IP="$(curl -sf https://ifconfig.me || curl -sf https://api.ipify.org || true)"
RESOLVED_IP="$(getent ahosts "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
if [[ -n "$PUBLIC_IP" && -n "$RESOLVED_IP" && "$PUBLIC_IP" != "$RESOLVED_IP" ]]; then
  echo "경고: DNS가 아직 이 서버를 가리키지 않을 수 있습니다."
  echo "  서버 공인 IP: ${PUBLIC_IP}"
  echo "  ${DOMAIN} 조회 IP: ${RESOLVED_IP}"
  if [[ "${FORCE_HTTPS:-}" != "1" ]]; then
    echo "  DNS 전파 후 다시 실행. 강제: FORCE_HTTPS=1 ./deploy/vps/setup-https.sh"
    exit 1
  fi
fi

echo "==> 웹 서버 기동 (HTTP, ACME)"
"${COMPOSE_BASE[@]}" up -d frontend

echo "==> Let's Encrypt 인증서 발급"
"${COMPOSE_BASE[@]}" --profile tools run --rm certbot \
  certonly \
  --webroot -w /var/www/certbot \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  --email "$CERTBOT_EMAIL" \
  --agree-tos --no-eff-email \
  --non-interactive

echo "==> HTTPS nginx 적용"
"${COMPOSE_HTTPS[@]}" up -d frontend

if grep -q '^SITE_URL=' .env; then
  if [[ "$(uname)" == Darwin ]]; then
    sed -i '' "s|^SITE_URL=.*|SITE_URL=https://${DOMAIN}|" .env
  else
    sed -i "s|^SITE_URL=.*|SITE_URL=https://${DOMAIN}|" .env
  fi
else
  echo "SITE_URL=https://${DOMAIN}" >> .env
fi

"${COMPOSE_BASE[@]}" up -d backend

echo ""
echo "HTTPS 설정 완료: https://${DOMAIN}"
echo "갱신: ./deploy/vps/renew-https.sh"
