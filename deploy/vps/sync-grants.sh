#!/usr/bin/env bash
# 지원사업 공공데이터 동기화 (최초·수동, 수 분~15분 소요)
# HTTPS 적용 후 localhost:80 은 301 이므로 백엔드(8080)에 직접 호출
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

echo "==> 백엔드 healthy 대기..."
for i in {1..30}; do
  if "${COMPOSE[@]}" exec -T backend wget -qO- http://localhost:8080/actuator/health 2>/dev/null | grep -q UP; then
    break
  fi
  sleep 3
done

echo "==> 동기화 전 공고 수"
api_get "/grants/active-count" || true
echo ""

echo "==> 기업마당(bizinfo) 동기화 (2~5분)..."
if api_post "/grants/sync/bizinfo"; then
  echo ""
  echo "==> bizinfo 완료"
else
  echo ""
  echo "오류: bizinfo 동기화 실패"
  echo "  ./deploy/vps/fix-api-key.sh"
  echo "  docker compose -f docker-compose.prod.yml logs backend --tail 50"
  exit 1
fi

echo ""
echo "==> (선택) 전체 소스 동기화 — HTML 포함, 30분+ 소요"
echo "    api_post \"/grants/sync\"  또는  ./deploy/vps/sync-grants.sh --all"
if [[ "${1:-}" == "--all" ]]; then
  echo "==> 전체 동기화 시작..."
  api_post "/grants/sync" || true
fi

echo ""
echo "==> 동기화 후 공고 수"
api_get "/grants/active-count" || true
echo ""
echo "==> 최근 동기화 이력"
api_get "/grants/sync/status" || true
echo ""
