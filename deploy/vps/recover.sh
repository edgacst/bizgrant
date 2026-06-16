#!/usr/bin/env bash
# 사이트 전체 복구 (hPanel 브라우저 터미널에서 실행)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)
DOMAIN="$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
DOMAIN="${DOMAIN:-bizgrant.kr}"

echo "========== BizGrant 긴급 복구 =========="

echo "==> 1) 서버 방화벽 (ufw)"
if command -v ufw &>/dev/null; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw status | head -15 || true
fi

echo "==> 2) 코드 최신화"
git checkout -- deploy/vps/ 2>/dev/null || true
git fetch origin main
git reset --hard origin/main
chmod +x deploy/vps/*.sh

echo "==> 3) Docker 기동"
"${COMPOSE[@]}" up -d

if ! curl -sf --connect-timeout 3 http://127.0.0.1/healthz >/dev/null 2>&1; then
  echo "    내부 접속 실패 — 재빌드 시도"
  "${COMPOSE[@]}" up -d --build
fi

echo "==> 4) frontend 재기동 (entrypoint SSL)"
"${COMPOSE[@]}" up -d --force-recreate frontend
sleep 4
"${COMPOSE[@]}" logs frontend --tail 5 || true

echo "==> 5) 내부 테스트"
curl -sS -o /dev/null -w "  80  → %{http_code}\n" --connect-timeout 5 http://127.0.0.1/healthz || echo "  80  → 실패"
curl -sS -o /dev/null -w "  443 → %{http_code}\n" --connect-timeout 5 -k "https://127.0.0.1/healthz" || echo "  443 → 실패"

echo ""
"${COMPOSE[@]}" ps
echo ""
echo "내부에서 80·443이 200이면 서버는 정상입니다."
echo "브라우저: https://${DOMAIN}"
echo "로그인은 사이트와 별개 — 비밀번호: ./deploy/vps/reset-admin-password.sh freecompr20@gmail.com 'kim14356/*'"
