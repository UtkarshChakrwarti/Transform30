#!/bin/bash
# Transform30 / Hunter System Test Runner
# Uses macOS built-in WebKit JavaScriptCore (jsc) engine

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/.." || exit 1

JSC_BIN="/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"

if [ -f "$JSC_BIN" ]; then
    echo "Running Transform30 Automated Test Suite via macOS WebKit JSC..."
    "$JSC_BIN" tests/test_suite.js
else
    echo "Error: macOS JavaScriptCore binary not found at $JSC_BIN"
    exit 1
fi
