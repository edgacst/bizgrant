#!/usr/bin/env bash
# 사이트 접속 불가 시 원인 빠르게 확인
set -euo pipefail

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

DOMAIN="$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
DOMAIN="${DOMAIN:-bizgrant.kr}"

echo "========== BizGrant 사이트 진단 =========="
echo "DOMAIN=${DOMAIN}"
echo ""

echo "==> 컨테이너 상태"
"${COMPOSE[@]}" ps
echo ""

echo "==> 서버 내부 HTTP/HTTPS"
curl -sS -o /dev/null -w "  127.0.0.1:80  → HTTP %{http_code}\n" --connect-timeout 3 http://127.0.0.1/healthz || echo "  127.0.0.1:80  → 실패"
curl -sS -o /dev/null -w "  127.0.0.1:443 → HTTPS %{http_code}\n" --connect-timeout 3 -k "https://127.0.0.1/healthz" 2>/dev/null \
  || echo "  127.0.0.1:443 → 실패 (nginx가 443을 안 듣거나 SSL 미적용)"
echo ""

echo "==> frontend nginx listen"
"${COMPOSE[@]}" exec -T frontend sh -c 'nginx -T 2>/dev/null | grep -E "listen (80|443)"' || true
echo ""

echo "==> 인증서 볼륨"
"${COMPOSE[@]}" exec -T frontend sh -c "ls -la /etc/letsencrypt/live/${DOMAIN}/ 2>/dev/null || echo '  인증서 없음 — ./deploy/vps/setup-https.sh 실행'"
echo ""

echo "==> ufw (서버 방화벽)"
if command -v ufw &>/dev/null; then
  ufw status | head -20
else
  echo "  ufw 없음"
fi
echo ""

echo "==> 해결 방법"
if curl -sS -o /dev/null --connect-timeout 2 http://127.0.0.1/healthz 2>/dev/null \
  && ! curl -sS -o /dev/null --connect-timeout 2 -k https://127.0.0.1/healthz 2>/dev/null; then
  echo "  ★ 지금 상태: HTTP만 동작 → ./deploy/vps/fix-https.sh 실행"
fi
echo "  HTTP만 되고 HTTPS 안 됨 → ./deploy/vps/fix-https.sh"
echo "  둘 다 안 됨 → hPanel 방화벽에서 TCP 80·443 열기"
echo "  인증서 없음 → ./deploy/vps/setup-https.sh"
