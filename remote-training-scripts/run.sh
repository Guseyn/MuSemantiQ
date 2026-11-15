#!/usr/bin/env bash

set -euo pipefail
source "$(dirname "$0")/lib.sh"

omr_prepare_bundle
export OMR_SKIP_UPLOAD=0
omr_upload
omr_train
omr_download
omr_verify
