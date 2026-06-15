#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d_%H%M)"
FILE="$BACKUP_DIR/bizgrant_${STAMP}.sql"

docker compose -f docker-compose.prod.yml --env-file .env exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-postgres}" "${POSTGRES_DB:-bizgrant}" > "$FILE"

gzip -f "$FILE"
echo "백업 완료: ${FILE}.gz"

find "$BACKUP_DIR" -name 'bizgrant_*.sql.gz' -mtime +14 -delete 2>/dev/null || true
