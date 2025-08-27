import type { StyleProp, ViewStyle } from 'react-native';

export type OnLoadEventPayload = {
  url: string;
};

export type AudioPlayerModuleEvents = {
  onAudioStartsPlaying: () => void;
  onAudioStopsPlaying: () => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type AudioPlayerViewProps = {
  url: string;
  onLoad: (event: { nativeEvent: OnLoadEventPayload }) => void;
  style?: StyleProp<ViewStyle>;
};

export type PlayAudioParams = {
  base64Text: string;
  sampleRate: number;
};

export type UseAudioPlayerParams = {
  onAudioStartsPlaying?: () => void;
  onAudioStopsPlaying?: () => void;
};

export type UseAudioPlayerReturn = {
  playAudio: (params: PlayAudioParams) => void;
  stopPlayingAudio: () => void;
  isAudioPlaying: boolean;
};
