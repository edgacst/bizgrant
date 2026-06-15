#!/usr/bin/env bash
# deploy/vps/*.sh 에서 source — HTTPS 설정 시 compose 오버레이 자동 포함
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

SSL_CONF="$ROOT/deploy/vps/generated/nginx.ssl.conf"
if [[ -f "$SSL_CONF" ]]; then
  COMPOSE+=( -f docker-compose.prod.https.yml )
fi
