#!/usr/bin/env bash
# 가벼운 복구 — git pull/빌드 없이 컨테이너만 재기동 (1분 이내)
set -euo pipefail

source "$(dirname "$0")/compose-env.sh"

DOMAIN="$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
DOMAIN="${DOMAIN:-bizgrant.kr}"

echo "==> ufw"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp 2>/dev/null || true
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
fi

echo "==> Docker 재기동"
"${COMPOSE[@]}" up -d

sleep 3

if ! "${COMPOSE[@]}" exec -T frontend sh -c "nginx -T 2>/dev/null | grep -q 'listen 443 ssl'"; then
  echo "==> HTTPS nginx 재적용"
  mkdir -p deploy/vps/generated
  sed "s/__DOMAIN__/${DOMAIN}/g" frontend/nginx.ssl.conf.template > deploy/vps/generated/nginx.ssl.conf
  docker compose -f docker-compose.prod.yml -f docker-compose.prod.https.yml --env-file .env up -d --force-recreate frontend
  sleep 2
fi

echo "==> 상태"
curl -sS -o /dev/null -w "  80  → %{http_code}\n" --connect-timeout 5 http://127.0.0.1/healthz || echo "  80  → 실패"
curl -sS -o /dev/null -w "  443 → %{http_code}\n" --connect-timeout 5 -k "https://127.0.0.1/healthz" || echo "  443 → 실패"
"${COMPOSE[@]}" ps
