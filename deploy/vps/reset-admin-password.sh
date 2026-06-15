#!/usr/bin/env bash
# 관리자 비밀번호 DB에서 재설정 (회원가입 후 ADMIN_PASSWORD가 안 먹을 때)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
COMPOSE=(docker compose -f docker-compose.prod.yml --env-file .env)

EMAIL="${1:-freecompr20@gmail.com}"
PASS="${2:-BizGrant2026!}"
EMAIL_LC="$(printf '%s' "$EMAIL" | tr '[:upper:]' '[:lower:]')"

echo "==> BCrypt 해시 생성"
HASH=$(docker run --rm -e PASS="$PASS" python:3-alpine sh -c '
pip install -q bcrypt >/dev/null
python -c "import bcrypt, os; print(bcrypt.hashpw(os.environ[\"PASS\"].encode(), bcrypt.gensalt(rounds=10)).decode())"
')

echo "==> 비밀번호 재설정: ${EMAIL_LC}"
# 이메일 소문자 통일 + BCrypt 해시의 $ 문자가 bash에서 깨지지 않도록 printf로 SQL 파이프
printf "UPDATE users SET email = lower(trim(email)), password_hash = '%s', role = 'ADMIN', status = 'ACTIVE' WHERE lower(email) = lower('%s');\n" \
  "$HASH" "$EMAIL" \
  | "${COMPOSE[@]}" exec -T postgres psql -U postgres -d bizgrant -v ON_ERROR_STOP=1

echo "==> DB 확인"
"${COMPOSE[@]}" exec -T postgres psql -U postgres -d bizgrant -c \
  "SELECT id, email, role, status, left(password_hash, 7) AS hash_prefix FROM users WHERE lower(email) = lower('${EMAIL}');"

echo "==> 해시 검증 (Python bcrypt)"
STORED_HASH=$("${COMPOSE[@]}" exec -T postgres psql -U postgres -d bizgrant -tAc \
  "SELECT password_hash FROM users WHERE lower(email) = lower('${EMAIL}');" | tr -d '[:space:]')
MATCH=$(docker run --rm -e PASS="$PASS" -e HASH="$STORED_HASH" python:3-alpine sh -c '
pip install -q bcrypt >/dev/null
python -c "import bcrypt, os; print(\"OK\" if bcrypt.checkpw(os.environ[\"PASS\"].encode(), os.environ[\"HASH\"].encode()) else \"FAIL\")"
')
if [[ "$MATCH" != "OK" ]]; then
  echo "오류: DB에 저장된 해시가 비밀번호와 일치하지 않습니다."
  exit 1
fi
echo "해시 일치: OK"

echo "==> API 로그인 테스트 (backend 컨테이너 내부)"
LOGIN_JSON=$(printf '{"email":"%s","password":"%s"}' "$EMAIL_LC" "$PASS")
HTTP_CODE=$("${COMPOSE[@]}" exec -T backend sh -c \
  "wget -qO- --server-response --header='Content-Type: application/json' --post-data='$LOGIN_JSON' http://localhost:8080/api/auth/login 2>&1" \
  | awk '/HTTP\// { code=$2 } END { print code+0 }')
if [[ "${HTTP_CODE:-0}" -eq 200 ]]; then
  echo "로그인 API: OK (HTTP 200)"
else
  echo "로그인 API: 실패 (HTTP ${HTTP_CODE:-?}) — ./deploy/vps/update.sh 로 백엔드 재배포 후 다시 시도하세요."
fi

echo ""
echo "완료. 로그인:"
echo "  이메일: ${EMAIL_LC}"
echo "  비밀번호: ${PASS}"
