#!/usr/bin/env bash
# VM에서 프로젝트 루트(bizgrant/)에서 실행
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  echo "  cp .env.prod.example .env"
  echo "  nano .env"
  exit 1
fi

echo "==> 이미지 빌드 및 기동 (첫 빌드 5~15분 소요)"
"${COMPOSE[@]}" up -d --build

echo "==> 백엔드 기동 대기..."
for i in {1..40}; do
  if "${COMPOSE[@]}" exec -T backend wget -qO- http://localhost:8080/actuator/health 2>/dev/null | grep -q UP; then
    break
  fi
  sleep 5
done

echo "==> 지원사업 동기화 (백그라운드, 수 분 소요)"
nohup docker compose -f docker-compose.prod.yml --env-file .env exec -T backend \
  wget -qO- --post-data="" http://localhost:8080/api/grants/sync \
  > /tmp/bizgrant-sync.log 2>&1 &
echo "    진행 로그: tail -f /tmp/bizgrant-sync.log"
echo "    완료 확인: ./deploy/vps/sync-grants.sh"

echo ""
echo "배포 완료. 브라우저에서 SITE_URL(.env) 로 접속하세요."
"${COMPOSE[@]}" ps
