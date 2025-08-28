import { useAudioBufferQueue } from "@/hooks/audio/useAudioBufferQueue";
import { useAudioStreamer } from "@/hooks/audio/useAudioStreamer";
import React, { useCallback, useState } from "react";
import { Button, View } from "react-native";
import { AudioBuffer, AudioContext } from "react-native-audio-api";

const Learn1 = () => {
  //const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);

  const {
    enqueueAudioBufferQueue,
    isAudioPlaying,
    playAudio,
    stopPlayingAudio,
    logState,
  } = useAudioBufferQueue({ sampleRate: 16000 });

  const onAudioReady = useCallback(
    (audioBuffer: AudioBuffer) => {
      //console.log(audioBuffer);
      //setAudioBuffers((prev) => [...prev, audioBuffer]);
      enqueueAudioBufferQueue(audioBuffer);
    },
    [enqueueAudioBufferQueue]
  );

  const { isRecording, startRecording, stopRecording } = useAudioStreamer({
    sampleRate: 16000,
    interval: 250,
    onAudioReady,
  });

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

      {isAudioPlaying ? (
        <Button title="Stop" onPress={stopPlayingAudio} />
      ) : (
        <Button title="Play Audio Buffers" onPress={playAudio} />
      )}
      <Button title="Log State" onPress={logState} />
    </View>
  );
};

export default Learn1;
