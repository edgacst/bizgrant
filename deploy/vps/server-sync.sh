#!/usr/bin/env bash
# 서버에서 pull 충돌 없이 최신 코드 받고 HTTPS까지 복구
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> 서버 로컬 수정 되돌리기 (deploy/vps 스크립트)"
git checkout -- deploy/vps/ 2>/dev/null || true

echo "==> git pull"
git pull origin main

chmod +x deploy/vps/*.sh

echo "==> 컨테이너 상태"
docker compose -f docker-compose.prod.yml --env-file .env ps || true

echo "==> HTTPS 복구"
"$(dirname "$0")/fix-https.sh"

echo ""
echo "==> 최종 진단"
"$(dirname "$0")/diagnose-site.sh"
