#!/bin/bash
# Simple build script for Systemix packages
# Usage: build.sh [entry] [outDir]

ENTRY="${1:-src/index.ts}"
OUT_DIR="${2:-dist}"

# Find build tool and run it
if command -v systemix-build &> /dev/null; then
    systemix-build --entry "$ENTRY" --outDir "$OUT_DIR" --clean
else
    # Try to find it in workspace
    BUILD_TOOL="$(pnpm why @systemix/build-tool 2>/dev/null | grep 'Reason: workspace' | cut -d':' -f2 | xargs)"
    if [ -n "$BUILD_TOOL" ] && [ -f "$BUILD_TOOL/dist/cli.js" ]; then
        node "$BUILD_TOOL/dist/cli.js" --entry "$ENTRY" --outDir "$OUT_DIR" --clean
    else
        echo "❌ @systemix/build-tool not found. Add it to devDependencies:"
        echo '   pnpm add -D @systemix/build-tool'
        exit 1
    fi
fi