#!/usr/bin/env bash
# Oracle Cloud Ubuntu ARM VM 초기 설정 (root 또는 sudo)
set -euo pipefail

echo "==> Docker 설치"
if ! command -v docker &>/dev/null; then
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

DEPLOY_USER="${SUDO_USER:-ubuntu}"
if id "$DEPLOY_USER" &>/dev/null; then
  usermod -aG docker "$DEPLOY_USER"
  echo "==> $DEPLOY_USER 를 docker 그룹에 추가 (재로그인 후 docker 명령 sudo 불필요)"
fi

echo "==> 방화벽 (ufw) — SSH·HTTP 허용"
if command -v ufw &>/dev/null; then
  ufw allow OpenSSH || true
  ufw allow 80/tcp || true
  ufw --force enable || true
fi

echo "==> 완료. 재로그인 후 deploy.sh 실행"
docker --version
docker compose version
