#!/usr/bin/env bash
# 공공데이터 API 키 .env 반영 + 백엔드 재시작
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

API_KEY='4kpciVHyniZJV%2BUGGyjbU80aUlB1VqT2BHBRMimmTdySD9O89LhD%2B3JYi%2FpZieBhoDnf5NjvrpBEjIK05TfNpA%3D%3D'

if [[ ! -f .env ]]; then
  echo "오류: .env 없음. cp .env.prod.example .env"
  exit 1
fi

if grep -q '^PUBLIC_DATA_API_KEY=' .env; then
  sed -i "s|^PUBLIC_DATA_API_KEY=.*|PUBLIC_DATA_API_KEY=${API_KEY}|" .env
else
  echo "PUBLIC_DATA_API_KEY=${API_KEY}" >> .env
fi

echo "==> .env PUBLIC_DATA_API_KEY 설정됨"
grep '^PUBLIC_DATA_API_KEY=' .env

echo "==> 백엔드 재시작"
docker compose -f docker-compose.prod.yml --env-file .env up -d backend

echo ""
echo "==> 컨테이너 안 키 확인 (앞 20자)"
docker compose -f docker-compose.prod.yml exec -T backend sh -c 'echo "$PUBLIC_DATA_API_KEY" | cut -c1-20'
echo ""
echo "다음: ./deploy/vps/sync-grants.sh"
