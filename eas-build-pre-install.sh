#!/usr/bin/env bash
# EAS Build Pre-Install Script
# This ensures npm is used instead of bun

echo "🔧 EAS Build Pre-Install Script"
echo "================================"

# Remove any bun lockfiles if they exist
if [ -f "bun.lock" ]; then
  echo "Removing bun.lock..."
  rm -f bun.lock
fi

if [ -f "bun.lockb" ]; then
  echo "Removing bun.lockb..."
  rm -f bun.lockb
fi

# Ensure we have a package-lock.json
if [ ! -f "package-lock.json" ]; then
  echo "Creating package-lock.json..."
  npm install --legacy-peer-deps
fi

echo "✅ Pre-install setup complete!"
