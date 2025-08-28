import { View, Text, Button } from "react-native";
import React, { useCallback, useEffect, useRef } from "react";
import { AudioRecorder, AudioContext } from "react-native-audio-api";

const Learn1 = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audiorecorderRef = useRef<AudioRecorder | null>(null);

  const startRecording = useCallback(() => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioRecorder = new AudioRecorder({
      sampleRate: 16000,
      bufferLengthInSamples: 16000,
    });

    const adapterNode = audioContext.createRecorderAdapter();

    adapterNode.connect(audioContext.destination);

    audioRecorder.connect(adapterNode);

    audioRecorder.onAudioReady((event) => {
      const { buffer, numFrames, when } = event;

      console.log(
        "Audio recorder buffer ready:",
        buffer.duration,
        numFrames,
        when
      );
    });
    audioRecorder.start();
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
