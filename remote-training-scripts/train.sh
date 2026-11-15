#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

if [[ ! -f "$OMR_REPOSITORY_ROOT/$OMR_BUNDLE_DIR/manifest.json" ]]; then
  omr_fail 'No frozen bundle. Run remote-training-scripts/prepare.sh first.'
fi
omr_upload
omr_train
omr_download
omr_log "Combined candidate: $OMR_REPOSITORY_ROOT/$OMR_CANDIDATE"
