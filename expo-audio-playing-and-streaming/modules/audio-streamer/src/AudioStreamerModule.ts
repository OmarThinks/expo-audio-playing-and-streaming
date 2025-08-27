import { NativeModule, requireNativeModule } from "expo";

import {
  AudioStreamConfig,
  AudioStreamerModuleEvents,
} from "./AudioStreamer.types";

declare class AudioStreamerModule extends NativeModule<AudioStreamerModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  startAudioStream(config: AudioStreamConfig): Promise<void>;
  stopAudioStream(): Promise<void>;
  isAudioStreaming(): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AudioStreamerModule>("AudioStreamer");
