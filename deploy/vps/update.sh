#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  exit 1
fi

if [[ -f "$SSL_CONF" ]]; then
  echo "==> HTTPS 설정 감지 — SSL nginx 오버레이 포함"
else
  echo "==> HTTP 모드 (HTTPS는 ./deploy/vps/setup-https.sh)"
fi

echo "==> 재빌드 및 재기동"
"${COMPOSE[@]}" up -d --build

echo "==> 백엔드 기동 대기..."
for i in {1..40}; do
  if "${COMPOSE[@]}" exec -T backend wget -qO- http://localhost:8080/actuator/health 2>/dev/null | grep -q UP; then
    break
  fi
  sleep 5
done

"${COMPOSE[@]}" ps
echo ""
echo "코드 반영 완료. 공고 동기화: ./deploy/vps/sync-grants.sh"
if [[ -f "$SSL_CONF" ]]; then
  echo "HTTPS 접속: $(grep -E '^SITE_URL=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || true)"
fi
