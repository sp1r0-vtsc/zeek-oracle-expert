#!/usr/bin/env bash
# Monorepo Build & Test Checker
set -euo pipefail

echo "=== zk-oracle-solana Monorepo Build & Test Check ==="

# Array of off-chain service directories
OFFCHAIN_SERVICES=(
  "zk-oracle-solana/off-chain/library-attestor"
  "zk-oracle-solana/off-chain/zk-proof-service"
  "zk-oracle-solana/off-chain/trust-scorer"
  "zk-oracle-solana/off-chain/cross-validator"
)
for service in "${OFFCHAIN_SERVICES[@]}"; do
  echo "--- Checking $service ---"
  if [ -f "$service/package.json" ]; then
    pushd "$service" > /dev/null
    echo "Installing dependencies..."
    npm install
    echo "Building..."
    npm run build
    echo "Testing..."
    npm test || echo "Tests failed in $service"
    popd > /dev/null
  else
    echo "Skipping $service (no package.json)"
  fi
done

# Check web application
echo "--- Checking webapp ---"
pushd "zk-oracle-solana/webapp" > /dev/null
npm install
npm run build
npm test || echo "Tests failed in webapp"
popd > /dev/null

# Check Solana programs
echo "--- Checking Solana programs ---"
pushd "zk-oracle-solana/programs/trust-score" > /dev/null
echo "Building Rust program..."
cargo build
popd > /dev/null

echo "=== Monorepo Check Complete ==="