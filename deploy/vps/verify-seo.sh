#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."

DOMAIN="$(grep -E '^DOMAIN=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo bizgrant.kr)"
DOMAIN="${DOMAIN:-bizgrant.kr}"
BASE="$(grep -E '^SITE_URL=' .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\"' || echo "https://${DOMAIN}")"
BASE="${BASE:-https://${DOMAIN}}"
BASE="${BASE%/}"

check() {
  local path="$1"
  local url="${BASE}${path}"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || echo '000')"
  if [[ "$code" == "200" ]]; then
    echo "OK  $code  $url"
  else
    echo "FAIL $code  $url"
    return 1
  fi
}

echo "=== SEO check (${BASE}) ==="
check "/robots.txt"
check "/sitemap.xml"
check "/"
check "/about"
check "/guide"

echo ""
echo "robots.txt Sitemap line:"
curl -sS "${BASE}/robots.txt" | grep -i sitemap || true

echo ""
echo "sitemap.xml URLs:"
curl -sS "${BASE}/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | head -10 || true
