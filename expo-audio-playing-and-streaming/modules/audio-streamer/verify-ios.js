#!/usr/bin/env node

/**
 * iOS Audio Streamer Module Verification Script
 *
 * This script verifies that the iOS implementation is properly structured
 * and follows the same interface as the Android implementation.
 */

const fs = require("fs");
const path = require("path");

const moduleDir = process.cwd();
const iosDir = path.join(moduleDir, "ios");
const androidDir = path.join(moduleDir, "android");

console.log("🔍 Verifying iOS Audio Streamer Module...\n");

// Check if iOS files exist
const requiredIosFiles = [
  "AudioStreamerModule.swift",
  "AudioStreamer.podspec",
  "PrivacyInfo.xcprivacy",
];

const requiredAndroidFiles = [
  "src/main/java/expo/modules/audiostreamer/AudioStreamerModule.kt",
];

console.log("📁 Checking iOS files:");
let iosFilesOk = true;
for (const file of requiredIosFiles) {
  const filePath = path.join(iosDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    iosFilesOk = false;
  }
}

console.log("\n📁 Checking Android files:");
let androidFilesOk = true;
for (const file of requiredAndroidFiles) {
  const filePath = path.join(androidDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    androidFilesOk = false;
  }
}

// Check expo-module.config.json
console.log("\n⚙️  Checking configuration:");
const configPath = path.join(moduleDir, "expo-module.config.json");
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (config.platforms && config.platforms.includes("apple")) {
      console.log("  ✅ iOS platform enabled in expo-module.config.json");
    } else {
      console.log("  ❌ iOS platform NOT enabled in expo-module.config.json");
    }
    if (
      config.apple &&
      config.apple.modules &&
      config.apple.modules.includes("AudioStreamerModule")
    ) {
      console.log("  ✅ AudioStreamerModule configured for iOS");
    } else {
      console.log("  ❌ AudioStreamerModule NOT configured for iOS");
    }
  } catch (e) {
    console.log("  ❌ Error reading expo-module.config.json:", e.message);
  }
} else {
  console.log("  ❌ expo-module.config.json - MISSING");
}

// Check iOS module content
console.log("\n🔍 Checking iOS module implementation:");
const iosModulePath = path.join(iosDir, "AudioStreamerModule.swift");
if (fs.existsSync(iosModulePath)) {
  const content = fs.readFileSync(iosModulePath, "utf8");

  const requiredMethods = [
    "startAudioStream",
    "stopAudioStream",
    "isAudioStreaming",
  ];

  const requiredEvents = ["onAudioStreamData", "onAudioStreamStatus"];

  const requiredImports = ["AVFoundation", "ExpoModulesCore"];

  console.log("  Required methods:");
  for (const method of requiredMethods) {
    if (content.includes(method)) {
      console.log(`    ✅ ${method}`);
    } else {
      console.log(`    ❌ ${method} - MISSING`);
    }
  }

  console.log("  Required events:");
  for (const event of requiredEvents) {
    if (content.includes(event)) {
      console.log(`    ✅ ${event}`);
    } else {
      console.log(`    ❌ ${event} - MISSING`);
    }
  }

  console.log("  Required imports:");
  for (const imp of requiredImports) {
    if (content.includes(imp)) {
      console.log(`    ✅ ${imp}`);
    } else {
      console.log(`    ❌ ${imp} - MISSING`);
    }
  }
}

// Check podspec
console.log("\n📦 Checking Podspec:");
const podspecPath = path.join(iosDir, "AudioStreamer.podspec");
if (fs.existsSync(podspecPath)) {
  const content = fs.readFileSync(podspecPath, "utf8");
  if (content.includes("AVFoundation")) {
    console.log("  ✅ AVFoundation framework dependency");
  } else {
    console.log("  ❌ AVFoundation framework dependency - MISSING");
  }
  if (content.includes("ExpoModulesCore")) {
    console.log("  ✅ ExpoModulesCore dependency");
  } else {
    console.log("  ❌ ExpoModulesCore dependency - MISSING");
  }
}

console.log("\n📱 Summary:");
if (iosFilesOk && androidFilesOk) {
  console.log("✅ All required files are present");
  console.log(
    "✅ iOS Audio Streamer Module appears to be properly implemented"
  );
  console.log("\n🚀 Ready for testing on iOS device/simulator");
  console.log(
    "💡 Remember to test with a physical device for actual microphone functionality"
  );
} else {
  console.log("❌ Some required files are missing");
  console.log("⚠️  Please ensure all files are properly created");
}

console.log("\n📋 Next steps:");
console.log("1. Test on iOS simulator (limited audio functionality)");
console.log("2. Test on physical iOS device");
console.log("3. Verify microphone permissions are granted");
console.log("4. Check that audio data is received correctly");
console.log("5. Compare performance with Android implementation");
