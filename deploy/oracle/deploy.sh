#!/usr/bin/env bash
# VM에서 프로젝트 루트(bizgrant/)에서 실행
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  echo "  cp .env.oracle.example .env"
  echo "  nano .env   # SITE_URL, JWT_SECRET, POSTGRES_PASSWORD, PUBLIC_DATA_API_KEY 설정"
  exit 1
fi

echo "==> 이미지 빌드 및 기동 (ARM 호환, 첫 빌드 10~20분 소요)"
docker compose -f docker-compose.oracle.yml --env-file .env up -d --build

echo "==> 백엔드 기동 대기..."
for i in {1..40}; do
  if docker compose -f docker-compose.oracle.yml --env-file .env exec -T backend wget -qO- http://localhost:8080/actuator/health 2>/dev/null | grep -q UP; then
    break
  fi
  sleep 5
done

echo "==> 최초 지원사업 동기화 (기업마당 등, 수 분 소요)"
curl -sf -X POST "http://localhost/api/grants/sync" || echo "동기화 요청 실패 — 나중에: curl -X POST http://localhost/api/grants/sync"

echo ""
echo "배포 완료. 브라우저에서 SITE_URL(.env) 로 접속하세요."
docker compose -f docker-compose.oracle.yml --env-file .env ps
