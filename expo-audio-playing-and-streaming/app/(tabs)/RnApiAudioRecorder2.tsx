import { View, Text, Button, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  AudioRecorder,
  RecorderAdapterNode,
  AudioContext,
} from "react-native-audio-api";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { useAudioStreamer } from "@/hooks/useAudioStreamer";

const RnApiAudioRecorder = () => {
  const { isRecording, startRecording, stopRecording, isInitialized } =
    useAudioStreamer();

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
