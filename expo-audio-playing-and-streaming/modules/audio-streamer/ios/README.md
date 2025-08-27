# iOS Audio Streamer Implementation

## Overview

This is the iOS implementation of the AudioStreamer module using AVAudioEngine for real-time audio capture and streaming.

## Features

- Real-time PCM 16-bit audio capture
- Configurable sample rate (default: 44100 Hz)
- Configurable interval for data chunks (default: 100ms)
- Mono channel audio (1 channel)
- Permission handling for microphone access
- Background audio processing

## Required Permissions

Add the following to your main app's `Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to the microphone to provide voice chat functionality.</string>
```

## Implementation Details

### Audio Engine

- Uses `AVAudioEngine` for high-performance audio capture
- Installs a tap on the input node to process audio in real-time
- Converts audio to PCM 16-bit format for consistency with Android

### Buffer Management

- Maintains an internal buffer to collect samples
- Sends data in configurable intervals to match the requested streaming pattern
- Thread-safe event emission to JavaScript

### Error Handling

- Comprehensive error handling for common audio issues
- Custom error types for different failure scenarios
- Graceful cleanup on errors

### Memory Management

- Efficient buffer management to prevent memory leaks
- Proper cleanup of audio resources when stopping

## API Compatibility

This implementation provides the same API as the Android version:

- `startAudioStream(config)` - Start audio streaming with configuration
- `stopAudioStream()` - Stop audio streaming
- `isAudioStreaming()` - Check if currently streaming

## Events

- `onAudioStreamData` - Emitted with audio data array
- `onAudioStreamStatus` - Emitted when streaming status changes

## Performance Considerations

- Audio processing happens on a background thread
- Events are dispatched to the main thread for JavaScript consumption
- Optimized buffer sizes for minimal latency
