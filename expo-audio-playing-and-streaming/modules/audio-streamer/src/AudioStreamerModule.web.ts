import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './AudioStreamer.types';

type AudioStreamerModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class AudioStreamerModule extends NativeModule<AudioStreamerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(AudioStreamerModule, 'AudioStreamerModule');
