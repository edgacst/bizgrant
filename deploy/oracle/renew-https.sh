#!/usr/bin/env bash
# Let's Encrypt 인증서 갱신 (cron: 0 4 * * 1)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

docker compose -f docker-compose.oracle.yml -f docker-compose.oracle.https.yml --env-file .env --profile tools run --rm certbot renew --quiet

docker compose -f docker-compose.oracle.yml -f docker-compose.oracle.https.yml --env-file .env exec -T frontend nginx -s reload 2>/dev/null \
  || docker compose -f docker-compose.oracle.yml -f docker-compose.oracle.https.yml --env-file .env restart frontend

echo "인증서 갱신 완료: $(date -Iseconds)"
