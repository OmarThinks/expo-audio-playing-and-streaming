import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type AudioStreamDataEventPayload = {
  data: number[];
};

export type AudioStreamStatusEventPayload = {
  isStreaming: boolean;
};

export type AudioStreamerModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
  onAudioStreamData: (params: AudioStreamDataEventPayload) => void;
  onAudioStreamStatus: (params: AudioStreamStatusEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type AudioStreamerViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export interface AudioStreamConfig {
  sampleRate: number;
  interval: number;
}

export interface UseAudioStreamOptions {
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onStreamData: (data: number[]) => void;
  sampleRate: number;
  interval: number;
}

export interface UseAudioStreamReturn {
  isStreaming: boolean;
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<void>;
}
