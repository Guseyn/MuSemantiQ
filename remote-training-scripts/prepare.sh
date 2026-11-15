#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

omr_prepare_bundle
omr_upload
omr_log "Frozen bundle is ready at $OMR_REMOTE_HOST:$OMR_REMOTE_DIR/$OMR_BUNDLE_DIR"
