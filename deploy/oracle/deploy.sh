#!/usr/bin/env bash
exec "$(cd "$(dirname "$0")/../vps" && pwd)/deploy.sh" "$@"
