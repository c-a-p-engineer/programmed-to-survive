#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="src"
OUT_DIR="public"

mkdir -p "${OUT_DIR}/assets"

rsync -a --delete "${SRC_DIR}/" "${OUT_DIR}/"

rm -f "${OUT_DIR}/assets/.keep"
