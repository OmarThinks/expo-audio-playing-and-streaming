import * as React from 'react';

import { AudioStreamerViewProps } from './AudioStreamer.types';

export default function AudioStreamerView(props: AudioStreamerViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
