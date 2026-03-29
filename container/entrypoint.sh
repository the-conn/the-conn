#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-}"
SIDEBAR_LIMIT="${NEXT_PUBLIC_SIDEBAR_LIMIT:-10}"
GIT_BASE_URL="${NEXT_PUBLIC_GIT_BASE_URL:-https://github.com}"

if [[ -z "$API_BASE_URL" ]]; then
  echo "[the-conn] WARN: NEXT_PUBLIC_API_BASE_URL is not set; API requests will fail" >&2
fi

substitute() {
  local placeholder="$1"
  local value="$2"
  local escaped
  escaped=$(printf '%s' "$value" | sed -e 's/[\/&|]/\\&/g')
  find /app/.next /app/public -type f \
    \( -name '*.js' -o -name '*.html' -o -name '*.json' -o -name '*.css' \) \
    -exec sed -i "s|${placeholder}|${escaped}|g" {} +
}

substitute "__APP_API_BASE_URL__" "$API_BASE_URL"
substitute "__APP_SIDEBAR_LIMIT__" "$SIDEBAR_LIMIT"
substitute "__APP_GIT_BASE_URL__" "$GIT_BASE_URL"

exec "$@"
