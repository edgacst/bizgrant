#!/usr/bin/env bash
# 기업마당(bizinfo) API만 빠르게 동기화 (VPS 권장)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)
API="http://localhost:8080/api"

api_get() {
  "${COMPOSE[@]}" exec -T backend wget -qO- "${API}$1" 2>/dev/null
}

api_post() {
  "${COMPOSE[@]}" exec -T backend wget -qO- --post-data="" "${API}$1" 2>/dev/null
}

echo "==> API 키 확인 (컨테이너)"
"${COMPOSE[@]}" exec -T backend sh -c 'test -n "$PUBLIC_DATA_API_KEY" && echo OK || echo MISSING'
"${COMPOSE[@]}" exec -T backend sh -c 'echo "$PUBLIC_DATA_API_KEY" | cut -c1-15'
echo ""

echo "==> 동기화 전"
api_get "/grants/active-count" || true
echo ""

echo "==> 기업마당(bizinfo) 동기화 (2~5분)..."
api_post "/grants/sync/bizinfo"
echo ""

echo "==> 동기화 후"
api_get "/grants/active-count" || true
echo ""
api_get "/grants/sync/status" || true
echo ""
