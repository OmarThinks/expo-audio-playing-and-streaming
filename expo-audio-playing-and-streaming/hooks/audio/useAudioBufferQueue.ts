import { useAudioStreamer } from "@/hooks/audio/useAudioStreamer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, View } from "react-native";
import {
  AudioBuffer,
  AudioBufferQueueSourceNode,
  AudioContext,
} from "react-native-audio-api";

const useAudioBufferQueue = ({ sampleRate }: { sampleRate: number }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferQueueRef = useRef<AudioBufferQueueSourceNode | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const resetState = useCallback(() => {
    setIsAudioPlaying(false);
    try {
      audioBufferQueueRef.current?.disconnect?.();
    } catch {}

    const audioContext = new AudioContext({ sampleRate });
    const audioBufferQueue = audioContext.createBufferQueueSource();
    audioBufferQueue.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    audioBufferQueueRef.current = audioBufferQueue;
  }, [sampleRate]);

  useEffect(() => {
    resetState();
    return resetState;
  }, [resetState]);

  const playAudio = useCallback(() => {
    if (audioBufferQueueRef.current) {
      console.log(
        "Number of inputs and outputs: ",
        audioBufferQueueRef.current.numberOfInputs,
        audioBufferQueueRef.current.numberOfOutputs
      );

      audioBufferQueueRef.current.start();
      setIsAudioPlaying(true);
      audioBufferQueueRef.current.onEnded = () => {
        resetState();
      };
    }
  }, [resetState]);

  const enqueueAudioBufferQueue = useCallback(() => {}, []);

  return {
    isAudioPlaying,
    enqueueAudioBufferQueue,
    stopPlayingAudio: resetState,
    playAudio,
  };
};

export { useAudioBufferQueue };
