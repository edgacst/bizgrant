#!/usr/bin/env bash
# update.sh 후 https:// 접속 안 될 때 — SSL nginx 설정만 다시 적용
set -euo pipefail

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

if [[ ! -f "$SSL_CONF" ]]; then
  echo "오류: $SSL_CONF 없음. 먼저 ./deploy/vps/setup-https.sh 실행"
  exit 1
fi

echo "==> HTTPS nginx 재적용"
"${COMPOSE[@]}" up -d frontend
"${COMPOSE[@]}" exec -T frontend wget -qO- http://localhost/ >/dev/null
echo "완료: https://$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
