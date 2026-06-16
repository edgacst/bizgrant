#!/usr/bin/env bash
# HTTPS(443) 복구 — HTTP는 되는데 https:// 만 안 열릴 때
set -euo pipefail

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

get_env() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env 2>/dev/null | tail -1 || true)"
  line="${line#*=}"
  line="${line%\"}"
  line="${line#\"}"
  echo "$line"
}

DOMAIN="$(get_env DOMAIN)"
DOMAIN="${DOMAIN:-bizgrant.kr}"
CERTBOT_EMAIL="$(get_env CERTBOT_EMAIL)"

echo "========== HTTPS 복구 (${DOMAIN}) =========="
echo ""

echo "==> 1) 인증서 확인"
CERT_OK=0
if "${COMPOSE[@]}" exec -T frontend sh -c "test -f /etc/letsencrypt/live/${DOMAIN}/fullchain.pem" 2>/dev/null; then
  echo "  인증서 있음: /etc/letsencrypt/live/${DOMAIN}/"
  CERT_OK=1
else
  echo "  인증서 없음 — setup-https.sh 로 발급 필요"
fi
echo ""

echo "==> 2) 프론트엔드 재빌드 (SSL 자동 감지 entrypoint)"
"${COMPOSE[@]}" up -d --build frontend
sleep 3
"${COMPOSE[@]}" logs frontend --tail 5
echo ""

echo "==> 3) nginx 모드 확인"
LISTEN=$("${COMPOSE[@]}" exec -T frontend sh -c 'nginx -T 2>/dev/null | grep -E "listen (80|443)"' || true)
echo "$LISTEN"
if echo "$LISTEN" | grep -q 'listen 443 ssl'; then
  echo "  → HTTPS nginx 적용됨"
else
  echo "  → 아직 HTTP 전용 (443 미적용)"
fi
echo ""

echo "==> 4) 서버 내부 포트 테스트"
curl -sS -o /dev/null -w "  127.0.0.1:80  HTTP %{http_code}\n" --connect-timeout 3 http://127.0.0.1/healthz || true
if curl -sS -o /dev/null -w "  127.0.0.1:443 HTTPS %{http_code}\n" --connect-timeout 3 -k "https://127.0.0.1/healthz" 2>/dev/null; then
  INTERNAL_443=1
else
  echo "  127.0.0.1:443 HTTPS 실패"
  INTERNAL_443=0
fi
echo ""

if [[ "$CERT_OK" -eq 0 ]]; then
  if [[ -z "$CERTBOT_EMAIL" ]]; then
    echo "오류: .env 에 CERTBOT_EMAIL=your@email.com 설정 후 다시 실행"
    exit 1
  fi
  echo "==> 5) 인증서 발급 (setup-https.sh)"
  FORCE_HTTPS=1 "$(dirname "$0")/setup-https.sh"
  exit 0
fi

if [[ "${INTERNAL_443:-0}" -eq 0 && "$CERT_OK" -eq 1 ]]; then
  echo "==> 5) frontend 강제 재생성"
  docker compose -f docker-compose.prod.yml --env-file .env up -d --force-recreate --build frontend
  sleep 4
  "${COMPOSE[@]}" logs frontend --tail 10 || true
  curl -sS -o /dev/null -w "  127.0.0.1:443 HTTPS %{http_code}\n" --connect-timeout 3 -k "https://127.0.0.1/healthz" \
    || echo "  여전히 443 실패 — docker compose logs frontend 확인"
fi

echo ""
echo "==> 6) ufw 443 허용"
if command -v ufw &>/dev/null; then
  ufw allow 443/tcp || true
  ufw status | grep -E '80|443' || true
fi

echo ""
echo "=========================================="
echo "브라우저에서 https://${DOMAIN} 접속해 보세요."
echo ""
echo "여전히 안 되면 Hostinger hPanel:"
echo "  VPS → Security → Firewall → TCP 443 추가"
echo "=========================================="
