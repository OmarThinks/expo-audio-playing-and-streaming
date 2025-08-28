import { useAudioStreamer } from "@/hooks/useAudioStreamer";
import { Buffer } from "buffer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import {
  AudioBuffer,
  AudioContext,
  AudioBufferQueueSourceNode,
} from "react-native-audio-api";
import { useBase64AudioPlayer } from ".";

const RnApiAudioRecorder = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const queueSourceNodeRef = useRef<AudioBufferQueueSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio context and queue source node
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    queueSourceNodeRef.current =
      audioContextRef.current.createBufferQueueSource();
    queueSourceNodeRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (queueSourceNodeRef.current) {
        queueSourceNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const onAudioReady = useCallback((buffer: AudioBuffer) => {
    // Handle the audio buffer when it's ready
    console.log("Audio buffer is ready:", buffer);

    // Queue the audio buffer directly instead of converting to base64
    if (queueSourceNodeRef.current) {
      const bufferId = queueSourceNodeRef.current.enqueueBuffer(buffer);
      console.log("Buffer added to queue with ID:", bufferId);
    }

    // Still keep base64 for display/debugging purposes if needed
    const floatData = buffer.getChannelData(0);
    const pcmData = new Int16Array(floatData.length);
    for (let i = 0; i < floatData.length; i++) {
      const sample = Math.max(-1, Math.min(1, floatData[i]));
      pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    const buffer16 = new Uint8Array(pcmData.buffer);
    const pcmBase64 = Buffer.from(buffer16).toString("base64");
    setMessages((prev) => [...prev, pcmBase64]);
  }, []);

  const { isRecording, startRecording, stopRecording, isInitialized } =
    useAudioStreamer({ sampleRate: 16000, interval: 250, onAudioReady });

  const _startRecording = () => {
    if (isInitialized) {
      setMessages([]);
      // Recreate the queue source node to ensure it's fresh
      console.log("Current queue node:", queueSourceNodeRef.current);
      if (audioContextRef.current) {
        try {
          // Disconnect the old node if it exists
          if (queueSourceNodeRef.current) {
            queueSourceNodeRef.current.disconnect();
          }

          // Create a new queue source node
          queueSourceNodeRef.current =
            audioContextRef.current.createBufferQueueSource();
          queueSourceNodeRef.current.connect(
            audioContextRef.current.destination
          );
          console.log("Created new audio buffer queue");
        } catch (error) {
          console.error("Error recreating queue source node:", error);
        }
      }
      startRecording();
    }
  };

  const playQueuedAudio = () => {
    if (queueSourceNodeRef.current && audioContextRef.current) {
      try {
        queueSourceNodeRef.current.start(audioContextRef.current.currentTime);
        setIsPlaying(true);
        console.log("Started playing queued audio");

        // Set up onEnded callback to handle when playback stops
        queueSourceNodeRef.current.onEnded = (event) => {
          if (event.bufferId === undefined) {
            // Queue source node has stopped playing
            console.log("Queue playback ended");
            setIsPlaying(false);
          } else {
            console.log(`Buffer ${event.bufferId} ended`);
          }
        };
      } catch (error) {
        console.error("Error starting queue playback:", error);
      }
    }
  };

  const stopQueuedAudio = () => {
    if (queueSourceNodeRef.current) {
      try {
        queueSourceNodeRef.current.stop();
        setIsPlaying(false);
        console.log("Stopped queued audio");

        // Recreate the queue source node for next use
        if (audioContextRef.current) {
          queueSourceNodeRef.current =
            audioContextRef.current.createBufferQueueSource();
          queueSourceNodeRef.current.connect(
            audioContextRef.current.destination
          );
        }
      } catch (error) {
        console.error("Error stopping queue playback:", error);
      }
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
      <Text style={{ marginBottom: 20 }}>
        Playing: {isPlaying ? "Yes" : "No"}
      </Text>
      <Text style={{ marginBottom: 20 }}>Audio chunks: {messages.length}</Text>
      <Button
        title={isRecording ? "Stop Recording" : "Start Recording"}
        onPress={isRecording ? stopRecording : _startRecording}
        disabled={!isInitialized}
      />

      <Button
        title={isPlaying ? "Stop Playing" : "Play Queued Audio"}
        onPress={isPlaying ? stopQueuedAudio : playQueuedAudio}
        disabled={messages.length === 0}
      />

      <Button
        title="Play Messages"
        onPress={() => {
          const mergedAudio = mergePCMBase64Strings(messages);
          playAudio({ base64Text: mergedAudio, sampleRate: 16000 });
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
