# Audio Streamer Module

A React Native Expo module for real-time audio streaming on Android and iOS. This module provides live audio input streaming without recording to files, making it perfect for real-time audio processing applications.

## Features

- **Real-time Audio Streaming**: Stream audio data directly from the microphone without recording to files
- **Cross-platform**: Support for both Android and iOS
- **Configurable Sample Rate**: Support for various sample rates (8kHz, 16kHz, 44.1kHz, etc.)
- **Configurable Intervals**: Set custom intervals for audio data chunks
- **PCM 16-bit Encoding**: Provides raw PCM audio data
- **Mono Channel**: Single channel audio input
- **Event-driven**: React to streaming events with callbacks
- **Permission Handling**: Automatic permission checking and error handling

## Installation

This module is included in your Expo project. Make sure you have the required permissions:

### Android

Add to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### iOS

Make sure your `app.config.ts` includes microphone permissions (already configured in this project):

```typescript
[
  "expo-audio",
  {
    microphonePermission: "Allow AI Therapist to access your microphone.",
  },
];
```

## Usage

### Basic Usage

```tsx
import React from "react";
import { useAudioStream } from "./modules/audio-streamer";

export const MyComponent = () => {
  const { isStreaming, startStreaming, stopStreaming } = useAudioStream({
    sampleRate: 16000, // 16kHz sample rate
    interval: 100, // 100ms intervals
    onStartStreaming: () => {
      console.log("Audio streaming started");
    },
    onStopStreaming: () => {
      console.log("Audio streaming stopped");
    },
    onStreamData: (data) => {
      console.log("Received audio data:", data.length, "samples");
      // Process your audio data here
      // data is an array of numbers representing PCM 16-bit samples
    },
  });

  const handleStart = async () => {
    try {
      await startStreaming();
    } catch (error) {
      console.error("Failed to start streaming:", error);
    }
  };

  const handleStop = async () => {
    try {
      await stopStreaming();
    } catch (error) {
      console.error("Failed to stop streaming:", error);
    }
  };

  return (
    <View>
      <Button
        title="Start Streaming"
        onPress={handleStart}
        disabled={isStreaming}
      />
      <Button
        title="Stop Streaming"
        onPress={handleStop}
        disabled={!isStreaming}
      />
      <Text>Status: {isStreaming ? "Streaming" : "Stopped"}</Text>
    </View>
  );
};
```

### Hook API

#### `useAudioStream(options: UseAudioStreamOptions): UseAudioStreamReturn`

**Options:**

- `sampleRate: number` - The sample rate for audio capture (e.g., 8000, 16000, 44100)
- `interval: number` - The interval in milliseconds for audio data chunks (e.g., 100 for 100ms chunks)
- `onStartStreaming: () => void` - Callback when streaming starts
- `onStopStreaming: () => void` - Callback when streaming stops
- `onStreamData: (data: number[]) => void` - Callback for each audio data chunk

**Returns:**

- `isStreaming: boolean` - Current streaming state
- `startStreaming: () => Promise<void>` - Function to start audio streaming
- `stopStreaming: () => Promise<void>` - Function to stop audio streaming

## Audio Data Format

The audio data received in `onStreamData` is:

- **Format**: PCM 16-bit signed integers
- **Channels**: Mono (single channel)
- **Sample Rate**: As configured in options
- **Data Type**: `number[]` - Array of integers representing audio samples
- **Range**: Values typically range from -32768 to 32767

## Common Use Cases

### Speech Recognition

```tsx
const { isStreaming, startStreaming, stopStreaming } = useAudioStream({
  sampleRate: 16000, // Optimal for speech recognition
  interval: 250, // 250ms chunks for speech processing
  onStreamData: (data) => {
    // Send audio data to speech recognition service
    processSpeechData(data);
  },
  // ... other callbacks
});
```

### Audio Analysis

```tsx
const { isStreaming, startStreaming, stopStreaming } = useAudioStream({
  sampleRate: 44100, // High quality for audio analysis
  interval: 50, // 50ms for real-time analysis
  onStreamData: (data) => {
    // Perform FFT, volume detection, etc.
    const volume = calculateVolume(data);
    const frequency = calculateDominantFrequency(data);
  },
  // ... other callbacks
});
```

## Error Handling

The module can throw the following errors:

- `ALREADY_RECORDING`: Streaming is already active
- `PERMISSION_DENIED`: Audio recording permission not granted
- `INVALID_CONFIG`: Invalid audio configuration
- `INITIALIZATION_FAILED`: Failed to initialize AudioRecord
- `START_FAILED`: Failed to start audio streaming
- `STOP_FAILED`: Failed to stop audio streaming

Always wrap streaming operations in try-catch blocks:

```tsx
try {
  await startStreaming();
} catch (error) {
  if (error.code === "PERMISSION_DENIED") {
    // Request permission from user
  } else if (error.code === "ALREADY_RECORDING") {
    // Handle already streaming case
  }
}
```

## Permissions

### Android

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

Request permission at runtime:

```tsx
import { PermissionsAndroid } from "react-native";

const requestAudioPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message: "This app needs access to your microphone to stream audio.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
```

## Performance Considerations

- **Sample Rate**: Higher sample rates provide better quality but consume more CPU and memory
- **Interval**: Smaller intervals provide lower latency but generate more events
- **Buffer Processing**: Process audio data efficiently to avoid blocking the UI thread
- **Memory Usage**: Be mindful of memory usage when storing or processing large amounts of audio data

## Recommended Settings

| Use Case           | Sample Rate | Interval   | Notes                      |
| ------------------ | ----------- | ---------- | -------------------------- |
| Speech Recognition | 16000 Hz    | 100-250 ms | Optimal balance for speech |
| Music Analysis     | 44100 Hz    | 50-100 ms  | High quality for music     |
| Voice Commands     | 8000 Hz     | 100 ms     | Low latency for commands   |
| Real-time Effects  | 44100 Hz    | 20-50 ms   | Low latency for effects    |

## Troubleshooting

### No Audio Data Received

- Check microphone permissions
- Ensure device has a working microphone
- Try different sample rates (some devices may not support all rates)

### Poor Audio Quality

- Increase sample rate
- Check for device-specific audio issues
- Ensure proper microphone access

### High CPU Usage

- Reduce sample rate
- Increase interval duration
- Optimize audio processing code

### Platform-Specific Issues

#### Android

- Some devices may have different audio hardware capabilities
- Check for OEM-specific audio modifications
- Test on various Android versions

#### iOS

- Ensure app has microphone permission in device settings
- Check if audio session is properly configured
- Test on both simulator and physical device (simulator may have limitations)

## Platform Detection

You can detect the platform and handle platform-specific behavior:

```tsx
import { Platform } from "react-native";

const { isStreaming, startStreaming, stopStreaming } = useAudioStream({
  sampleRate: Platform.OS === "ios" ? 44100 : 16000, // iOS prefers 44.1kHz
  interval: Platform.OS === "ios" ? 50 : 100, // iOS can handle shorter intervals
  onStreamData: (data) => {
    console.log(`[${Platform.OS}] Received ${data.length} samples`);
  },
  // ... other options
});
```

## Testing

The module includes test screens at `app/testing/screens/TestStreamingNativeModule.tsx` that can be used to verify functionality on both platforms.

## Example Component

See `components/AudioStreamExample.tsx` for a complete working example that demonstrates all features of the audio streaming module.
