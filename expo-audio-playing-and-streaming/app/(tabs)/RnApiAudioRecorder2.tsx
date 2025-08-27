import { useAudioStreamer } from "@/hooks/useAudioStreamer";
import React, { useCallback, useState } from "react";
import { Button, Text, View } from "react-native";
import { AudioBuffer } from "react-native-audio-api";
import { useBase64AudioPlayer } from ".";
import { Buffer } from "buffer";

const RnApiAudioRecorder = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const onAudioReady = useCallback((buffer: AudioBuffer) => {
    // Handle the audio buffer when it's ready
    console.log("Audio buffer is ready:", buffer);

    // Get the float32 channel data
    const floatData = buffer.getChannelData(0);

    // Convert Float32Array to 16-bit PCM
    const pcmData = new Int16Array(floatData.length);
    for (let i = 0; i < floatData.length; i++) {
      // Clamp to [-1, 1] and convert to 16-bit integer
      const sample = Math.max(-1, Math.min(1, floatData[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    // Convert to base64
    const buffer16 = new Uint8Array(pcmData.buffer);
    const pcmBase64 = Buffer.from(buffer16).toString("base64");

    console.log("PCM Base64:", pcmBase64);
    setMessages((prev) => [...prev, pcmBase64]);
  }, []);

  const { isRecording, startRecording, stopRecording, isInitialized } =
    useAudioStreamer({ sampleRate: 16000, interval: 250, onAudioReady });

  const _startRecording = () => {
    if (isInitialized) {
      setMessages([]);
      startRecording();
    }
  };

  const { playAudio } = useBase64AudioPlayer();

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
        onPress={isRecording ? stopRecording : _startRecording}
        disabled={!isInitialized}
      />

      <Button
        title="Play Messages"
        onPress={() => {
          const combined = mergePCMBase64Strings(messages);
          console.log("Combined PCM Base64:", combined);
          playAudio({ base64Text: combined, sampleRate: 16000 });
        }}
      />
    </View>
  );
};

function mergePCMBase64Strings(pcmBase64List: string[]): string {
  if (pcmBase64List.length === 0) {
    return "";
  }

  if (pcmBase64List.length === 1) {
    return pcmBase64List[0];
  }

  // Convert all base64 strings to binary data
  const binaryDataArrays: Uint8Array[] = pcmBase64List.map((base64String) => {
    // Remove any data URL prefix if present (e.g., "data:audio/pcm;base64,")
    const cleanBase64 = base64String.replace(/^data:.*?;base64,/, "");

    // Decode base64 to binary
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  });

  // Calculate total length
  const totalLength = binaryDataArrays.reduce(
    (sum, array) => sum + array.length,
    0
  );

  // Create merged array
  const mergedArray = new Uint8Array(totalLength);
  let offset = 0;

  for (const array of binaryDataArrays) {
    mergedArray.set(array, offset);
    offset += array.length;
  }

  // Convert back to base64
  let binaryString = "";
  for (let i = 0; i < mergedArray.length; i++) {
    binaryString += String.fromCharCode(mergedArray[i]);
  }

  return btoa(binaryString);
}

export default RnApiAudioRecorder;
