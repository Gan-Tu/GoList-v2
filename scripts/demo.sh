#!/usr/bin/env bash
# Copyright 2022 Gan Tu
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Brings up the whole stack locally: emulator suite, seed data, and the web app
# pointed at the emulators. Nothing touches the production project, so this
# needs no Firebase credentials.
#
#   ./scripts/demo.sh   →   http://localhost:3000
#
# Ctrl-C stops everything.

set -euo pipefail
cd "$(dirname "$0")/.."

command -v firebase >/dev/null 2>&1 || {
  echo "firebase CLI not found. Install it with: npm install -g firebase-tools"
  exit 1
}
command -v java >/dev/null 2>&1 || {
  echo "Java not found — the Firestore emulator needs a JRE (e.g. brew install temurin)."
  exit 1
}

LOG_DIR="$(mktemp -d)"
EMULATOR_LOG="$LOG_DIR/emulators.log"
PIDS=()

cleanup() {
  echo ""
  echo "Shutting down…"
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting the Firebase emulator suite (logs: $EMULATOR_LOG)…"
npm run emulators >"$EMULATOR_LOG" 2>&1 &
PIDS+=($!)

# The emulators take a few seconds; polling beats a fixed sleep.
for _ in $(seq 1 120); do
  if grep -q "All emulators ready" "$EMULATOR_LOG" 2>/dev/null; then break; fi
  if grep -qE "Error:|EADDRINUSE" "$EMULATOR_LOG" 2>/dev/null; then
    echo "The emulators failed to start:"
    tail -20 "$EMULATOR_LOG"
    exit 1
  fi
  sleep 1
done

grep -q "All emulators ready" "$EMULATOR_LOG" || {
  echo "Timed out waiting for the emulators. Last lines:"
  tail -20 "$EMULATOR_LOG"
  exit 1
}

echo "Seeding demo collections…"
npm run seed

echo ""
echo "───────────────────────────────────────────────"
echo "  App          http://localhost:3000"
echo "  Emulator UI  http://127.0.0.1:4000"
echo ""
echo "  Try:  /web-mobile   a populated collection"
echo "        /empty-list   the empty state"
echo "        /nope-nope    the not-found state"
echo "───────────────────────────────────────────────"
echo ""

npm --prefix frontend run dev:emulated &
PIDS+=($!)

wait
