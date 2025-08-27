import { View, Text, Button } from "react-native";
import React, { useRef } from "react";
import {
  AudioRecorder,
  RecorderAdapterNode,
  AudioContext,
  AudioBuffer,
} from "react-native-audio-api";

const RnApiAudioRecorder = () => {
  const recorderRef = useRef<AudioRecorder | null>(null);

  const startRecorder = () => {
    const recorder = new AudioRecorder({
      sampleRate: 16000,
      bufferLengthInSamples: 16000,
    });

    recorder.onAudioReady((event) => {
      const { buffer, numFrames, when } = event;

      console.log(
        "Audio recorder buffer ready:",
        buffer.duration,
        numFrames,
        when
      );
    });

    const audioContext = new AudioContext();

    const adapterNode = new RecorderAdapterNode(audioContext, recorder);

    recorder.start();

    recorderRef.current = recorder;
  };

  //

  return (
    <View>
      <Text>RnApiAudioRecorder</Text>
      <Button
        title="Start Recording"
        onPress={() => {
          startRecorder();
        }}
      />
    </View>
  );
};

export default RnApiAudioRecorder;
