#!/usr/bin/env bash
# 기업마당 API에서 기관별 공고 분류 수집 (kita, sba, kotra, kised, kocca, kosme)
# application-prod.yml 에 해당 소스 enabled: true 필요
set -euo pipefail

source "$(dirname "$0")/compose-env.sh"

API="http://localhost:8080/api"

api_post() {
  "${COMPOSE[@]}" exec -T backend wget -qO- --post-data="" "${API}$1" 2>/dev/null
}

INSTITUTIONS=(kita sba kotra kised kocca kosme)

echo "==> 기업마당 전체 동기화"
api_post "/grants/sync/bizinfo"
echo ""

for name in "${INSTITUTIONS[@]}"; do
  echo "==> ${name} 동기화"
  api_post "/grants/sync/${name}" || echo "  (건너뜀 — prod 설정에서 비활성화됐을 수 있음)"
done

echo ""
echo "==> BIZINFO → 기관별 재분류"
api_post "/grants/reclassify-institutions"
echo ""
api_post "/grants/sync/status"
echo ""
echo "완료. 랜딩은 공개 API 3채널 기준 — 기관별 카드는 관리자 대시보드에서 확인하세요."
