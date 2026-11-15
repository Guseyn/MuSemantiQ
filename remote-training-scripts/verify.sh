#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

if [[ ! -f "$OMR_REPOSITORY_ROOT/$OMR_CANDIDATE" ]]; then
  omr_fail "Candidate not found: $OMR_CANDIDATE. Run download.sh first."
fi
omr_verify
