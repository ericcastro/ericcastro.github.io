#!/bin/zsh

set -euo pipefail

SOURCE_DIR="/Users/eric/Developer/retruco/dist/retruco-static"
TARGET_DIR="/Users/eric/Developer/ericcastro.github.io/public/retruco"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "RETRUCO static build not found at $SOURCE_DIR" >&2
  exit 1
fi

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "$SOURCE_DIR"/. "$TARGET_DIR"/

echo "Synced RETRUCO widget bundle to $TARGET_DIR"
