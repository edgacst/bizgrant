#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE_HTTPS=(docker compose -f docker-compose.prod.yml -f docker-compose.prod.https.yml --env-file .env)

"${COMPOSE_HTTPS[@]}" --profile tools run --rm certbot renew --quiet

"${COMPOSE_HTTPS[@]}" exec -T frontend nginx -s reload 2>/dev/null \
  || "${COMPOSE_HTTPS[@]}" restart frontend

echo "인증서 갱신 완료: $(date -Iseconds)"
