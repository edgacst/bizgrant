#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

# shellcheck source=compose-env.sh
source "$(dirname "$0")/compose-env.sh"

SQL_FILE="backend/sql/V4__seed_board_demo.sql"
if [[ ! -f "$SQL_FILE" ]]; then
  echo "오류: $SQL_FILE 없음"
  exit 1
fi

echo "==> 공개 게시판 데모 Q&A 시드"
"${COMPOSE[@]}" exec -T postgres \
  psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-bizgrant}" -v ON_ERROR_STOP=1 \
  < "$SQL_FILE"

MASK_FILE="backend/sql/V5__mask_board_author_names.sql"
if [[ -f "$MASK_FILE" ]]; then
  echo "==> 작성자명 마스킹 갱신"
  "${COMPOSE[@]}" exec -T postgres \
    psql -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-bizgrant}" -v ON_ERROR_STOP=1 \
    < "$MASK_FILE"
fi

echo "완료. https://bizgrant.kr/board 에서 확인하세요."
