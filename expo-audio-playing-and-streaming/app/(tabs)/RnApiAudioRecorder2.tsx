import { useAudioStreamer } from "@/hooks/useAudioStreamer";
import React from "react";
import { Button, Text, View } from "react-native";

const RnApiAudioRecorder = () => {
  const { isRecording, startRecording, stopRecording, isInitialized } =
    useAudioStreamer({ sampleRate: 16000, interval: 250 });

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>RnApiAudioRecorder</Text>
      <Text style={{ marginBottom: 10 }}>
        Status: {isInitialized ? "Initialized" : "Initializing..."}
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Recording: {isRecording ? "Yes" : "No"}
      </Text>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={!isInitialized}
      />
    </View>
  );
};

export default RnApiAudioRecorder;
