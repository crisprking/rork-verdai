#!/bin/bash

# Force CocoaPods version 1.14.3 to avoid 1.15.0 issues
echo "🔧 Installing CocoaPods 1.14.3 to avoid known issues with 1.15.0..."
sudo gem uninstall cocoapods --all --force
sudo gem install cocoapods -v 1.14.3

# Clear CocoaPods cache
echo "🧹 Clearing CocoaPods cache..."
pod cache clean --all

echo "✅ Pre-install setup complete!"
