#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

"${COMPOSE[@]}" --profile tools run --rm certbot renew --quiet

"${COMPOSE[@]}" exec -T frontend nginx -s reload 2>/dev/null \
  || "${COMPOSE[@]}" restart frontend

echo "인증서 갱신 완료: $(date -Iseconds)"
