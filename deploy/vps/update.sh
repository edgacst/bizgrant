#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

if [[ ! -f .env ]]; then
  echo "오류: .env 파일이 없습니다."
  exit 1
fi

SITE_URL="$(grep -E '^SITE_URL=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || true)"
if [[ "$SITE_URL" == https://* ]]; then
  echo "==> HTTPS 사이트 (entrypoint 자동 SSL)"
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

SITE_URL="$(grep -E '^SITE_URL=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || true)"
if [[ "$SITE_URL" == https://* ]]; then
  echo "==> HTTPS 확인"
  sleep 2
  if ! "${COMPOSE[@]}" exec -T frontend sh -c "nginx -T 2>/dev/null | grep -q 'listen 443 ssl'" 2>/dev/null; then
    "$(dirname "$0")/fix-https.sh" || "$(dirname "$0")/ensure-up.sh"
  fi
  if ! curl -sf --connect-timeout 3 -k "https://127.0.0.1/healthz" >/dev/null 2>&1; then
    echo "경고: HTTPS 내부 접속 실패 — ./deploy/vps/ensure-up.sh 실행"
  fi
fi
