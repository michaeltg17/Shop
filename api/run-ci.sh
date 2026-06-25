#!/bin/bash
set -e

# Fix: Set NUGET_PACKAGES to a fixed absolute path so testhost can find packages at runtime
export NUGET_PACKAGES=/root/.nuget/packages

echo "========================================="
echo "  Running CI Pipeline in Docker"
echo "========================================="
echo "NUGET_PACKAGES=$NUGET_PACKAGES"

# Step 1: Build and test
echo ""
echo "[1/1] Building and running tests..."

# Verify FluentAssertions package is in cache
echo "Verifying FluentAssertions in NuGet cache..."
ls "$NUGET_PACKAGES/fluentassertions/8.10.0/lib/net6.0/FluentAssertions.dll" 2>/dev/null && echo "OK: FluentAssertions found" || echo "WARN: FluentAssertions DLL missing"

dotnet test tests/Api.Tests/Api.Tests.csproj --verbosity normal
echo "Tests passed"

echo ""
echo "========================================="
echo "  All CI checks passed!"
echo "========================================="
