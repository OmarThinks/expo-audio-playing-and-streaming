import { dummyBase64Text } from "@/samples/dummyBase64Text";
import React, { useCallback, useRef, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { AudioBufferSourceNode, AudioContext } from "react-native-audio-api";

const useBase64AudioPlayer = () => {
  const playerNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const playAudio = useCallback(
    ({
      base64Text,
      sampleRate,
    }: {
      base64Text: string;
      sampleRate: number;
    }) => {
      const audioContext = new AudioContext();

      // Convert base64 to raw PCM data
      const arrayBuffer = base64AudioTextToArrayBuffer(base64Text);
      const pcmData = new Int16Array(arrayBuffer);

      // Create audio buffer with the specified sample rate
      const audioBuffer = audioContext.createBuffer(
        1,
        pcmData.length,
        sampleRate
      );
      const channelData = audioBuffer.getChannelData(0);

      // Convert Int16 PCM data to Float32 for Web Audio API
      for (let i = 0; i < pcmData.length; i++) {
        channelData[i] = pcmData[i] / 32768.0; // Normalize 16-bit to -1.0 to 1.0
      }

      const playerNode = audioContext.createBufferSource();
      playerNode.buffer = audioBuffer;

      playerNode.connect(audioContext.destination);
      setIsAudioPlaying(true);
      playerNode.start(audioContext.currentTime);
      playerNode.stop(audioContext.currentTime + audioBuffer.duration);
      playerNode.onEnded = () => {
        playerNodeRef.current = null;
        console.log("ended");
        setIsAudioPlaying(false);
      };
      playerNodeRef.current = playerNode;
    },
    []
  );

  const stopPlayingAudio = useCallback(() => {
    playerNodeRef.current?.stop?.();
    playerNodeRef.current = null;
  }, []);

  return { playAudio, isAudioPlaying, stopPlayingAudio };
};

export default function TabTwoScreen() {
  const { isAudioPlaying, playAudio, stopPlayingAudio } =
    useBase64AudioPlayer();

  return (
    <View style={{ alignSelf: "stretch", flex: 1, padding: 16 }}>
      <Text>Is Playing: {`${isAudioPlaying}`}</Text>

      {!isAudioPlaying ? (
        <Button
          title="Play Audio"
          onPress={() => {
            playAudio({ base64Text: dummyBase64Text, sampleRate: 16000 });
          }}
        />
      ) : (
        <Button title="Stop Playing Audio" onPress={stopPlayingAudio} />
      )}
    </View>
  );
}

function base64AudioTextToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
