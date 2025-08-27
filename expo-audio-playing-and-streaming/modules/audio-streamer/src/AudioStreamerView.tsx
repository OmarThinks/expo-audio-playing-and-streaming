import { requireNativeView } from 'expo';
import * as React from 'react';

import { AudioStreamerViewProps } from './AudioStreamer.types';

const NativeView: React.ComponentType<AudioStreamerViewProps> =
  requireNativeView('AudioStreamer');

export default function AudioStreamerView(props: AudioStreamerViewProps) {
  return <NativeView {...props} />;
}
