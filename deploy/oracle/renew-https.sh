#!/usr/bin/env bash
exec "$(cd "$(dirname "$0")/../vps" && pwd)/renew-https.sh" "$@"
