#!/bin/bash
set -e

echo "========================================="
echo "  Running CI Pipeline in Docker"
echo "========================================="

# Step 1: Prettier check
echo ""
echo "[1/6] Running prettier check..."
npm run prettier:check
echo "✓ Prettier check passed"

# Step 2: Linting
echo ""
echo "[2/6] Running linting..."
npm run lint
echo "✓ Linting passed"

# Step 3: Unit tests with coverage
echo ""
echo "[3/6] Running unit tests..."
npm run test:coverage
echo "✓ Unit tests passed"

# Step 4: Build
echo ""
echo "[4/6] Building application..."
npm run build
echo "✓ Build successful"

# Step 5: Playwright tests
echo ""
echo "[5/6] Running Playwright tests..."
npm run playwright
echo "✓ Playwright tests passed"

# Step 6: Stryker mutation testing
echo ""
echo "[6/6] Running Stryker mutation testing..."
npm run stryker
echo "✓ Stryker mutation testing passed"

echo ""
echo "========================================="
echo "  All CI checks passed!"
echo "========================================="