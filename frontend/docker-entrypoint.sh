#!/bin/sh
set -e

DOMAIN="${DOMAIN:-bizgrant.kr}"
CERT="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
CONF="/etc/nginx/conf.d/default.conf"

if [ -f "$CERT" ] && [ -f "$KEY" ]; then
  echo "nginx: HTTPS mode (${DOMAIN})"
  sed "s/__DOMAIN__/${DOMAIN}/g" /etc/nginx/templates/ssl.conf.template > "$CONF"
else
  echo "nginx: HTTP only (no cert at ${CERT})"
  cp /etc/nginx/templates/http.conf "$CONF"
fi

exec "$@"
