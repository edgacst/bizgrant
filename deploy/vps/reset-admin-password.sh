#!/usr/bin/env bash
# 관리자 비밀번호 DB에서 재설정 (회원가입 후 ADMIN_PASSWORD가 안 먹을 때)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

EMAIL="${1:-freecompr20@gmail.com}"
PASS="${2:-BizGrant2026!}"

echo "==> BCrypt 해시 생성"
HASH=$(docker run --rm python:3-alpine sh -c "
pip install -q bcrypt >/dev/null
python -c \"import bcrypt; print(bcrypt.hashpw(b'${PASS}', bcrypt.gensalt(rounds=10)).decode())\"
")

echo "==> 비밀번호 재설정: ${EMAIL}"
"${COMPOSE[@]}" exec -T postgres psql -U postgres -d bizgrant -v ON_ERROR_STOP=1 <<SQL
UPDATE users
SET password_hash = '${HASH}',
    role = 'ADMIN',
    status = 'ACTIVE'
WHERE lower(email) = lower('${EMAIL}');
SQL

echo ""
echo "완료. 로그인:"
echo "  이메일: ${EMAIL}"
echo "  비밀번호: ${PASS}"
