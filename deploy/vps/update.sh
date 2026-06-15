#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  exit 1
fi

echo "==> 재빌드 및 재기동"
"${COMPOSE[@]}" up -d --build

echo "==> 백엔드 기동 대기..."
for i in {1..40}; do
  if "${COMPOSE[@]}" exec -T backend wget -qO- http://localhost:8080/actuator/health 2>/dev/null | grep -q UP; then
    break
  fi
  sleep 5
done

"${COMPOSE[@]}" ps
echo ""
echo "코드 반영 완료. 공고 동기화: ./deploy/vps/sync-grants.sh"
