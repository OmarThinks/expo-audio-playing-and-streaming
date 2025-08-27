import { NativeModule, requireNativeModule } from 'expo';

import { AudioPlayerModuleEvents } from './AudioPlayer.types';

declare class AudioPlayerModule extends NativeModule<AudioPlayerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  playAudio(base64Text: string, sampleRate: number): Promise<void>;
  stopPlayingAudio(): Promise<void>;
  isAudioPlaying(): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AudioPlayerModule>('AudioPlayer');
