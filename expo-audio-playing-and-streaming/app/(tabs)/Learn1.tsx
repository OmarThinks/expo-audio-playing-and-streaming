import { useAudioStreamer } from "@/hooks/audio/useAudioStreamer";
import React, { useCallback } from "react";
import { Button, View } from "react-native";
import { AudioBuffer } from "react-native-audio-api";

const Learn1 = () => {
  const onAudioReady = useCallback((audioBuffer: AudioBuffer) => {
    console.log(audioBuffer);
  }, []);

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
    </View>
  );
};

export default Learn1;
