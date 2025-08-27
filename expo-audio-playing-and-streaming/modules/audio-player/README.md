# Audio Player Module

This module provides a native audio player for React Native applications that can play base64 encoded audio data.

## Installation

The module is already set up as a local dependency in your project.

## Usage

```tsx
import { useAudioPlayer } from 'audio-player';

const MyComponent = () => {
  const { playAudio, stopPlayingAudio, isAudioPlaying } = useAudioPlayer({
    onAudioStartsPlaying: () => {
      console.log('Audio started playing');
    },
    onAudioStopsPlaying: () => {
      console.log('Audio stopped playing');
    },
  });

  const handlePlayAudio = () => {
    playAudio({
      base64Text: "YOUR_BASE64_AUDIO_DATA_HERE",
      sampleRate: 16000,
    });
  };

  const handleStopAudio = () => {
    stopPlayingAudio();
  };

  return (
    <View>
      <Button title="Play Audio" onPress={handlePlayAudio} />
      <Button title="Stop Audio" onPress={handleStopAudio} />
      <Text>Playing: {isAudioPlaying ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

## API

### `useAudioPlayer(params)`

Hook that provides audio playback functionality.

**Parameters:**
- `params.onAudioStartsPlaying?: () => void` - Callback when audio starts playing
- `params.onAudioStopsPlaying?: () => void` - Callback when audio stops playing

**Returns:**
- `playAudio: (params: PlayAudioParams) => void` - Function to start playing audio
- `stopPlayingAudio: () => void` - Function to stop playing audio
- `isAudioPlaying: boolean` - Current playback state

### `PlayAudioParams`

- `base64Text: string` - Base64 encoded audio data
- `sampleRate: number` - Audio sample rate (e.g., 16000, 44100)

## Features

- ✅ Native audio playback on Android and iOS
- ✅ Base64 audio data support
- ✅ Configurable sample rate
- ✅ Real-time playback status
- ✅ Event callbacks for playback state changes
- ✅ Background thread processing for smooth performance

## Platform Support

- ✅ Android (using AudioTrack)
- ✅ iOS (using AVAudioPlayer)
- ❌ Web (not implemented)

## Test File

A test file is available at `app/test-audio-player.tsx` to demonstrate the module usage.
