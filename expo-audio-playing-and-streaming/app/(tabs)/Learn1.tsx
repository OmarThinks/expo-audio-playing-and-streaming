import { useAudioStreamer } from "@/hooks/audio/useAudioStreamer";
import React, { useCallback, useState } from "react";
import { Button, View } from "react-native";
import { AudioBuffer, AudioContext } from "react-native-audio-api";

const Learn1 = () => {
  const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);

  const onAudioReady = useCallback((audioBuffer: AudioBuffer) => {
    setAudioBuffers((prev) => [...prev, audioBuffer]);
  }, []);

  const { isRecording, startRecording, stopRecording } = useAudioStreamer({
    sampleRate: 16000,
    interval: 250,
    onAudioReady,
  });

  const playAudioBuffers = useCallback(() => {
    const audioContext = new AudioContext({ sampleRate: 16000 });

    const audioBufferQueue = audioContext.createBufferQueueSource();

    for (const audioBuffer of audioBuffers) {
      audioBufferQueue.enqueueBuffer(audioBuffer);
    }
    audioBufferQueue.connect(audioContext.destination);
    audioBufferQueue.start(audioContext.currentTime);
  }, [audioBuffers]);

  return (
    <View
      style={{
        flex: 1,
        alignSelf: "stretch",
        alignItems: "stretch",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
      />

      {audioBuffers.length > 0 && (
        <Button title="Play Audio Buffers" onPress={playAudioBuffers} />
      )}
    </View>
  );
};

export default Learn1;
