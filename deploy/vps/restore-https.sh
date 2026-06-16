#!/usr/bin/env bash
# update.sh 후 https:// 접속 안 될 때
set -euo pipefail

source "$(dirname "$0")/compose-env.sh"

echo "==> HTTPS nginx 재적용 (entrypoint)"
"${COMPOSE[@]}" up -d --force-recreate frontend
sleep 3
"${COMPOSE[@]}" exec -T frontend wget -qO- http://localhost/healthz >/dev/null
echo "완료: https://$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
