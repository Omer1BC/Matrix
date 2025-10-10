#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  . "$ENV_FILE"
  set +a
else
  echo "⚠️  No .env found at $ENV_FILE (LLM-backed tests may be skipped)."
fi

BASE_URL="${BASE_URL:-http://localhost:8000/api/agent}"
USER_ID="${USER_ID:-u1}"
PROBLEM_ID_DETERMINISTIC="${PROBLEM_ID_DETERMINISTIC:-2_connectedComps}"

PROBLEM_ID_INT="${PROBLEM_ID_INT:-1}"

CODE_BAD=$'def countComponents(n: int, edges: list[list[int]]) -> int:\n\treturn 0'

post_and_kind () {
  local json="$1"
  curl -sS -f "$BASE_URL" \
    -H 'Content-Type: application/json' \
    -d "$json" | jq -r '.kind // empty'
}

assert_kind () {
  local expected="$1"; shift
  local json
  json="$(jq -n "$@")"
  local kind
  kind="$(post_and_kind "$json" || true)"
  if [[ "$kind" != "$expected" ]]; then
    echo "❌ FAIL: expected kind='$expected' got kind='${kind:-<empty>}'"
    echo "Payload was:"
    echo "$json" | jq .
    exit 1
  fi
  echo "✅ PASS: kind='$expected'"
}

echo "=== Agent smoke tests against: $BASE_URL ==="

echo "--- Route by explicit intent: tests"
assert_kind "tests" \
  --arg user_id "$USER_ID" \
  --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
  --arg intent "tests" \
  --arg code "$CODE_BAD" \
  '$ARGS.named'

echo "--- Route by message (no intent): tests"
assert_kind "tests" \
  --arg user_id "$USER_ID" \
  --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
  --arg message "please run tests on this code" \
  --arg code "$CODE_BAD" \
  '$ARGS.named'

if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "--- LLM-backed: hints"
  assert_kind "hints" \
    --arg user_id "$USER_ID" \
    --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
    --arg intent "hints" \
    --arg question "Number of Connected Components in an undirected graph" \
    --arg code "$CODE_BAD" \
    '$ARGS.named'

  echo "--- LLM-backed: annotated_hints"
  assert_kind "annotated_hints" \
    --arg user_id "$USER_ID" \
    --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
    --arg intent "annotated_hints" \
    --arg question "Number of Connected Components in an undirected graph" \
    --arg code "$CODE_BAD" \
    '$ARGS.named'

  echo "--- LLM-backed: tool_hints (pattern=DFS)"
  assert_kind "tool_hints" \
    --arg user_id "$USER_ID" \
    --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
    --arg intent "tool_hints" \
    --arg question "Number of Connected Components in an undirected graph" \
    --arg code "$CODE_BAD" \
    --argjson extras '{"pattern":"DFS"}' \
    '$ARGS.named'

  echo "--- LLM-backed: grade (runs tests + rubric)"
  assert_kind "grade" \
    --arg user_id "$USER_ID" \
    --arg problem_id "$PROBLEM_ID_DETERMINISTIC" \
    --arg intent "grade" \
    --arg question "Number of Connected Components in an undirected graph" \
    --arg code "$CODE_BAD" \
    '$ARGS.named'

  echo "--- LLM-backed: annotate_errors (expects int problem_id)"
  assert_kind "annotate_errors" \
    --arg user_id "$USER_ID" \
    --arg problem_id "$PROBLEM_ID_INT" \
    --arg intent "annotate_errors" \
    --arg code $'def countComponents(n: int, edges: list[list[int]]) -> int\n    return 0' \
    --argjson extras '{"error":"SyntaxError: expected \":\" at line 1"}' \
    '$ARGS.named'
else
  echo "⚠️  OPENAI_API_KEY not set – skipping LLM-backed routes (hints, annotated_hints, tool_hints, grade, annotate_errors)."
fi

echo "🎯 All selected tests passed."