#!/usr/bin/env bash
# 코드 변경 후 재배포
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  exit 1
fi

echo "==> 재빌드 및 재기동"
docker compose -f docker-compose.oracle.yml --env-file .env up -d --build

echo "==> 상태"
docker compose -f docker-compose.oracle.yml ps
