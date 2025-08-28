import { View, Text, Button, Alert } from "react-native";
import React, { useCallback, useEffect, useRef } from "react";
import {
  AudioRecorder,
  AudioContext,
  RecorderAdapterNode,
} from "react-native-audio-api";
import { requestRecordingPermissionsAsync } from "expo-audio";

const Learn1 = () => {
  //const audioContextRef = useRef<AudioContext | null>(null);
  //const audiorecorderRef = useRef<AudioRecorder | null>(null);

  const startRecording = useCallback(async () => {
    const permissionResult = await requestRecordingPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Error", "Audio recording permission is required");
      return;
    }

    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioRecorder = new AudioRecorder({
      sampleRate: 16000,
      bufferLengthInSamples: 16000,
    });

    const recorderAdapterNode = audioContext.createRecorderAdapter();

    recorderAdapterNode.connect(audioContext.destination);

    audioRecorder.connect(recorderAdapterNode);

    audioRecorder.onAudioReady((event) => {
      console.log("Hi");
      const { buffer, numFrames, when } = event;

      console.log(
        "Audio recorder buffer ready:",
        buffer.duration,
        numFrames,
        when
      );
    });
    console.log("I should start now");
    audioRecorder.start();
    //audioRecorder.
  }, []);

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
      <Button title="Start Recording" onPress={startRecording} />
    </View>
  );
};

export default Learn1;
