import { requestRecordingPermissionsAsync } from "expo-audio";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, View } from "react-native";
import {
  AudioBuffer,
  AudioContext,
  AudioRecorder,
} from "react-native-audio-api";

const useAudioRecorder = ({
  sampleRate,
  interval,
  onAudioReady,
}: {
  sampleRate: number;
  interval: number;
  onAudioReady: (audioBuffer: AudioBuffer) => void;
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const resetState = useCallback(() => {
    setIsRecording(false);
    try {
      audioRecorderRef.current?.stop?.();
    } catch {}
  }, []);

  useEffect(() => {
    return resetState;
  }, [resetState]);

  const startRecording = useCallback(async () => {
    const permissionResult = await requestRecordingPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Error", "Audio recording permission is required");
      return;
    }

    const audioContext = new AudioContext({ sampleRate });
    const audioRecorder = new AudioRecorder({
      sampleRate: sampleRate,
      bufferLengthInSamples: (sampleRate * interval) / 1000,
    });

    const recorderAdapterNode = audioContext.createRecorderAdapter();

    audioRecorder.connect(recorderAdapterNode);

    audioRecorder.onAudioReady((event) => {
      const { buffer } = event;

      onAudioReady(buffer);
    });
    console.log("I should start now");
    audioRecorder.start();
    setIsRecording(true);

    audioContextRef.current = audioContext;
    audioRecorderRef.current = audioRecorder;
  }, [interval, onAudioReady, sampleRate]);

  return {
    isRecording,
    startRecording,
    stopRecording: resetState,
  };
};

const Learn1 = () => {
  const onAudioReady = useCallback((audioBuffer: AudioBuffer) => {
    console.log(audioBuffer);
  }, []);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder({
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
