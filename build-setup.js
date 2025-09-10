#!/usr/bin/env node

/**
 * FloraMind AI Plants - Build Setup Script
 * Ensures clean builds by removing conflicting lockfiles and optimizing configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🌱 FloraMind AI Plants - Build Setup');
console.log('=====================================');

// Remove conflicting lockfiles that cause bun install issues
const lockfilesToRemove = [
  'bun.lock',
  'yarn.lock'
];

lockfilesToRemove.forEach(lockfile => {
  const lockfilePath = path.join(__dirname, lockfile);
  if (fs.existsSync(lockfilePath)) {
    try {
      fs.unlinkSync(lockfilePath);
      console.log(`✅ Removed conflicting ${lockfile}`);
    } catch (error) {
      console.warn(`⚠️  Could not remove ${lockfile}:`, error.message);
    }
  }
});

// Ensure package.json is optimized for EAS builds
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update to FloraMind AI Plants configuration
    packageJson.name = 'floramind-ai-plants';
    packageJson.version = '1.0.0';
    packageJson.description = 'AI-powered plant identification and health diagnosis app';
    
    // Ensure proper scripts for EAS
    packageJson.scripts = {
      "start": "expo start",
      "android": "expo start --android", 
      "ios": "expo start --ios",
      "web": "expo start --web",
      "build:ios": "eas build --platform ios",
      "build:android": "eas build --platform android",
      "submit:ios": "eas submit --platform ios"
    };

    // Optimize dependencies for plant identification
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Ensure core Expo dependencies
    packageJson.dependencies.expo = packageJson.dependencies.expo || "~53.0.0";
    packageJson.dependencies["expo-file-system"] = packageJson.dependencies["expo-file-system"] || "~17.0.1";
    packageJson.dependencies["expo-image-picker"] = packageJson.dependencies["expo-image-picker"] || "~15.0.7";
    packageJson.dependencies["expo-camera"] = packageJson.dependencies["expo-camera"] || "~15.0.16";
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Optimized package.json for FloraMind AI Plants');
  } catch (error) {
    console.error('❌ Failed to optimize package.json:', error.message);
  }
}

// Verify app.json configuration
const appJsonPath = path.join(__dirname, 'app.json');
if (fs.existsSync(appJsonPath)) {
  try {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (appJson.expo && appJson.expo.name === 'FloraMind: AI Plants') {
      console.log('✅ App configuration verified for FloraMind AI Plants');
    } else {
      console.warn('⚠️  App configuration may need adjustment');
    }
  } catch (error) {
    console.error('❌ Failed to verify app.json:', error.message);
  }
}

console.log('');
console.log('🚀 Build setup complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run: eas build --platform ios');
console.log('2. Or trigger build via GitHub Actions');
console.log('3. Your FloraMind plant app is ready! 🌱');
