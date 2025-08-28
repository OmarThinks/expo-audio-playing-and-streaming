import { useAudioBufferQueue } from "@/hooks/audio/useAudioBufferQueue";
import { useAudioStreamer } from "@/hooks/audio/useAudioStreamer";
import React, { useCallback } from "react";
import { Button, Text, View } from "react-native";
import { AudioBuffer } from "react-native-audio-api";

const Learn1 = () => {
  const {
    enqueueAudioBufferQueue,
    isAudioPlaying,
    playAudio,
    stopPlayingAudio,
  } = useAudioBufferQueue({ sampleRate: 16000 });

  const onAudioReady = useCallback(
    (audioBuffer: AudioBuffer) => {
      enqueueAudioBufferQueue(audioBuffer);
    },
    [enqueueAudioBufferQueue]
  );

  const { isRecording, startRecording, stopRecording } = useAudioStreamer({
    sampleRate: 16000,
    interval: 1000,
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

      <Text>Is Audio Playing: {isAudioPlaying ? "True" : "False"}</Text>
    </View>
  );
};

export default Learn1;
