#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
BUNDLED_NODE="/Users/goohoo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if [ -x "$BUNDLED_NODE" ]; then
  NODE_BIN="$BUNDLED_NODE"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  echo "Node.js was not found."
  echo "Install Node.js, or run this project inside Codex where the bundled runtime is available."
  exit 1
fi

cd "$SCRIPT_DIR"
exec "$NODE_BIN" server.js
