#!/usr/bin/env bash
# 가벼운 복구 — git pull/빌드 없이 컨테이너만 재기동 (1분 이내)
set -euo pipefail

source "$(dirname "$0")/compose-env.sh"

echo "==> ufw"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp 2>/dev/null || true
  ufw allow 80/tcp 2>/dev/null || true
  ufw allow 443/tcp 2>/dev/null || true
fi

echo "==> Docker 재기동 (frontend entrypoint 가 SSL 자동 설정)"
"${COMPOSE[@]}" up -d --force-recreate frontend
sleep 4

if ! curl -sf --connect-timeout 3 http://127.0.0.1/healthz >/dev/null 2>&1; then
  echo "==> frontend 로그"
  "${COMPOSE[@]}" logs frontend --tail 25 || true
  echo "==> frontend 재빌드"
  "${COMPOSE[@]}" up -d --build --force-recreate frontend
  sleep 5
fi

"${COMPOSE[@]}" up -d

echo "==> 상태"
curl -sS -o /dev/null -w "  80  → %{http_code}\n" --connect-timeout 5 http://127.0.0.1/healthz || echo "  80  → 실패"
curl -sS -o /dev/null -w "  443 → %{http_code}\n" --connect-timeout 5 -k "https://127.0.0.1/healthz" || echo "  443 → 실패"
"${COMPOSE[@]}" ps
