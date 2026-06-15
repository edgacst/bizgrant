#!/usr/bin/env bash
# 사이트 전체 다운(80·443 둘 다 타임아웃) 시 빠른 점검
set -euo pipefail

source "$(dirname "$0")/compose-env.sh"

echo "========== 긴급 점검 =========="

echo "==> Docker 컨테이너"
"${COMPOSE[@]}" ps
echo ""

echo "==> 호스트에서 80/443 리스닝"
if command -v ss &>/dev/null; then
  ss -tlnp | grep -E ':80 |:443 ' || echo "  80/443 리스닝 없음!"
elif command -v netstat &>/dev/null; then
  netstat -tlnp | grep -E ':80 |:443 ' || echo "  80/443 리스닝 없음!"
fi
echo ""

echo "==> 로컬 접속"
curl -sS -o /dev/null -w "  127.0.0.1:80 → %{http_code}\n" --connect-timeout 3 http://127.0.0.1/healthz 2>/dev/null \
  || echo "  127.0.0.1:80 → 실패 (컨테이너 중지 또는 포트 미바인딩)"
curl -sS -o /dev/null -w "  127.0.0.1:443 → %{http_code}\n" --connect-timeout 3 -k https://127.0.0.1/healthz 2>/dev/null \
  || echo "  127.0.0.1:443 → 실패 (SSL nginx 미적용)"
echo ""

echo "==> ufw"
ufw status 2>/dev/null | head -15 || echo "  ufw 없음"
echo ""

echo "==> 복구 명령"
echo "  ./deploy/vps/server-sync.sh          # pull + HTTPS 복구"
echo "  docker compose -f docker-compose.prod.yml --env-file .env up -d   # 컨테이너만 재기동"
