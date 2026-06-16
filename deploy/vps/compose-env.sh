#!/usr/bin/env bash
# deploy/vps/*.sh 에서 source
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

# 예전 nginx.ssl.conf + :ro 마운트는 entrypoint와 충돌해 web 컨테이너가 재시작 루프에 빠짐
SSL_CONF="$ROOT/deploy/vps/generated/nginx.ssl.conf"
if [[ -f "$SSL_CONF" ]]; then
  rm -f "$SSL_CONF"
fi
