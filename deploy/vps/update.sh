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
"${COMPOSE[@]}" ps
