import { registerWebModule, NativeModule } from 'expo';

// Simple web implementation - audio playback not supported on web
const AudioPlayerModule = {
  PI: Math.PI,
  hello() {
    return 'Hello world! 👋';
  },
  async setValueAsync(value: string): Promise<void> {
    // No-op for web
    console.warn('setValueAsync not supported on web');
  },
  async playAudio(base64Text: string, sampleRate: number): Promise<void> {
    console.warn('Audio playback is not supported on web platform');
    throw new Error('Audio playback not supported on web');
  },
  async stopPlayingAudio(): Promise<void> {
    console.warn('Audio playback is not supported on web platform');
  },
  async isAudioPlaying(): Promise<boolean> {
    return false; // Always false on web
  },
  addListener(eventName: string, listener: (...args: any[]) => void) {
    console.warn(`Event listener for ${eventName} not supported on web`);
    return { remove: () => {} };
  },
  removeAllListeners(eventName?: string) {
    console.warn('removeAllListeners not supported on web');
  },
};

export default AudioPlayerModule;
