#!/bin/bash
set -e

cd "$CLAUDE_PROJECT_DIR"

# Format
npm run fmt

# Lint
npm run lint
