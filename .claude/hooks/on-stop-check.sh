#!/bin/bash
set -e

cd "$CLAUDE_PROJECT_DIR"

echo "Running format..."
npm run fmt

echo "Running lint..."
npm run lint

echo "Running typecheck..."
npm run typecheck

echo "Running unit tests..."
npm run test --workspace=@mermaid-er-editor/core

echo "Running build..."
npm run build

echo "All checks passed!"
