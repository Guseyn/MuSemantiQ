#!/usr/bin/env bash

# Edit these once, or override them in the environment before running a script.
OMR_REMOTE_HOST="${OMR_REMOTE_HOST:-user@server}"
OMR_REMOTE_DIR="${OMR_REMOTE_DIR:-MuSemantiQ}"

# The same relative paths exist locally and remotely.
OMR_BUNDLE_DIR="${OMR_BUNDLE_DIR:-training-data/remote-bundle}"
OMR_SYMBOL_RUN_DIR="${OMR_SYMBOL_RUN_DIR:-training-data/symbol-runs/candidate}"
OMR_OCR_RUN_DIR="${OMR_OCR_RUN_DIR:-training-data/text-runs/candidate-ocr}"
OMR_CANDIDATE="${OMR_CANDIDATE:-training-data/candidates/combined.json}"

OMR_EPOCHS="${OMR_EPOCHS:-40}"
OMR_OCR_EPOCHS="${OMR_OCR_EPOCHS:-20}"
OMR_GRID="${OMR_GRID:-48}"
OMR_SEED="${OMR_SEED:-20261115}"
OMR_VARIANTS="${OMR_VARIANTS:-1}"
OMR_LOCAL_GEOMETRY="${OMR_LOCAL_GEOMETRY:-0.15}"
OMR_SCALES="${OMR_SCALES:-0.5,0.75,1,1.5,2,3}"

# Commit before freezing. Set this to 1 only for a deliberate working-tree run.
OMR_ALLOW_DIRTY="${OMR_ALLOW_DIRTY:-0}"
OMR_SKIP_PRETRAINING_TESTS="${OMR_SKIP_PRETRAINING_TESTS:-0}"
OMR_SKIP_UPLOAD="${OMR_SKIP_UPLOAD:-0}"
