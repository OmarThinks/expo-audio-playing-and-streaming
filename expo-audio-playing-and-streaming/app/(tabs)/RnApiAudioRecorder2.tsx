import { useAudioStreamer } from "@/hooks/useAudioStreamer";
import { Buffer } from "buffer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import {
  AudioBuffer,
  AudioContext,
  AudioBufferQueueSourceNode,
} from "react-native-audio-api";

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
      // Clear any existing buffers in the queue
      console.log(queueSourceNodeRef.current);
      if (queueSourceNodeRef.current) {
        queueSourceNodeRef.current.clearBuffers();
        console.log("Cleared audio buffer queue");
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
    </View>
  );
};

export default RnApiAudioRecorder;
