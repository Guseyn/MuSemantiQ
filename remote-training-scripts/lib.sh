#!/usr/bin/env bash

set -euo pipefail

OMR_REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=remote-training-scripts/config.sh
source "$OMR_REPOSITORY_ROOT/remote-training-scripts/config.sh"
export OMR_REPOSITORY_ROOT

omr_log () {
  printf '\n==> %s\n' "$*"
}

omr_fail () {
  printf 'error: %s\n' "$*" >&2
  return 1
}

omr_require_clean_checkout () {
  if [[ "$OMR_ALLOW_DIRTY" == 1 ]]; then
    return
  fi
  if [[ -n "$(git -C "$OMR_REPOSITORY_ROOT" status --porcelain)" ]]; then
    omr_fail 'Commit the frozen code and docs first, or set OMR_ALLOW_DIRTY=1 deliberately.'
  fi
}

omr_prepare_bundle () {
  omr_require_clean_checkout
  export OMR_CODE_VERSION="${OMR_CODE_VERSION:-$(git -C "$OMR_REPOSITORY_ROOT" rev-parse HEAD)}"
  if [[ "$OMR_SKIP_PRETRAINING_TESTS" != 1 ]]; then
    omr_log 'Run the pre-training checks'
    (cd "$OMR_REPOSITORY_ROOT" && npm run test:pretraining)
  fi
  omr_log 'Generate the frozen full-page bundle'
  (cd "$OMR_REPOSITORY_ROOT" && npm run omr:prepare-remote -- \
    --out="$OMR_BUNDLE_DIR" \
    --code-version="$OMR_CODE_VERSION" \
    --data-version=1 \
    --config-version=1 \
    --scales="$OMR_SCALES" \
    --variants="$OMR_VARIANTS" \
    --seed="$OMR_SEED" \
    --local-geometry="$OMR_LOCAL_GEOMETRY")
}

omr_upload () {
  if [[ "$OMR_SKIP_UPLOAD" == 1 ]]; then
    omr_log 'Skip repository upload'
    return
  fi
  omr_log "Upload the frozen checkout to $OMR_REMOTE_HOST:$OMR_REMOTE_DIR"
  ssh "$OMR_REMOTE_HOST" "mkdir -p $(printf '%q' "$OMR_REMOTE_DIR")"
  rsync -az \
    --exclude=.git \
    --exclude=node_modules \
    --exclude=training-data/runs \
    --exclude=training-data/text-runs \
    --exclude=training-data/candidates \
    "$OMR_REPOSITORY_ROOT/" "$OMR_REMOTE_HOST:$OMR_REMOTE_DIR/"
}

omr_ssh () {
  ssh "$OMR_REMOTE_HOST" "cd $(printf '%q' "$OMR_REMOTE_DIR") && $*"
}

omr_train () {
  omr_log 'Train the symbol model remotely'
  omr_ssh "npm run omr:train:full-page -- \
    --data=$OMR_BUNDLE_DIR/manifest.json \
    --epochs=$OMR_EPOCHS \
    --grid=$OMR_GRID \
    --seed=$OMR_SEED \
    --out=$OMR_SYMBOL_RUN_DIR"
  omr_log 'Train the six-language OCR model remotely'
  omr_ssh "npm run omr:train:text -- \
    --epochs=$OMR_OCR_EPOCHS \
    --grid=$OMR_GRID \
    --seed=$OMR_SEED \
    --out=$OMR_OCR_RUN_DIR"
}

omr_download () {
  omr_log 'Download both training runs'
  mkdir -p "$OMR_REPOSITORY_ROOT/$OMR_SYMBOL_RUN_DIR" "$OMR_REPOSITORY_ROOT/$OMR_OCR_RUN_DIR"
  rsync -az "$OMR_REMOTE_HOST:$OMR_REMOTE_DIR/$OMR_SYMBOL_RUN_DIR/" "$OMR_REPOSITORY_ROOT/$OMR_SYMBOL_RUN_DIR/"
  rsync -az "$OMR_REMOTE_HOST:$OMR_REMOTE_DIR/$OMR_OCR_RUN_DIR/" "$OMR_REPOSITORY_ROOT/$OMR_OCR_RUN_DIR/"
  omr_log 'Combine the symbol and OCR artifacts'
  (cd "$OMR_REPOSITORY_ROOT" && npm run omr:combine-artifacts -- \
    --symbols="$OMR_SYMBOL_RUN_DIR/best-weights.json" \
    --ocr="$OMR_OCR_RUN_DIR/best-weights.json" \
    --out="$OMR_CANDIDATE")
}

omr_verify () {
  omr_log 'Verify clean canonical fixtures in both music fonts'
  (cd "$OMR_REPOSITORY_ROOT" && npm run omr:verify -- \
    --weights="$OMR_CANDIDATE" \
    --all \
    --out=training-data/verification-failures-bravura)
  (cd "$OMR_REPOSITORY_ROOT" && npm run omr:verify -- \
    --weights="$OMR_CANDIDATE" \
    --all \
    --fixture-font=leland \
    --out=training-data/verification-failures-leland)
  omr_log 'Verify the frozen styled and degraded bundle'
  (cd "$OMR_REPOSITORY_ROOT" && npm run omr:verify:remote -- \
    --weights="$OMR_CANDIDATE" \
    --data="$OMR_BUNDLE_DIR/manifest.json")
  omr_log 'Run the legacy OMR suite with the same artifact'
  (cd "$OMR_REPOSITORY_ROOT" && OMR_WEIGHTS="$OMR_CANDIDATE" npm run test:omr:all)
  omr_log 'Candidate verified; run the CLI manually with --weights='"$OMR_CANDIDATE"
}
