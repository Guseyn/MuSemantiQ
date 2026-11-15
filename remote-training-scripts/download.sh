#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

omr_download
omr_log "Combined candidate: $OMR_REPOSITORY_ROOT/$OMR_CANDIDATE"
