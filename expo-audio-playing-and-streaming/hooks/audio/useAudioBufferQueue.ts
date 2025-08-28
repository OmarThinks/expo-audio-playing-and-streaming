import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioBuffer,
  AudioBufferQueueSourceNode,
  AudioContext,
} from "react-native-audio-api";

const useAudioBufferQueue = ({ sampleRate }: { sampleRate: number }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferQueueRef = useRef<AudioBufferQueueSourceNode | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const queueLengthRef = useRef(0);

  const lastBufferIdRef = useRef("");

  const resetState = useCallback(() => {
    setIsAudioPlaying(false);
    try {
      audioBufferQueueRef.current?.clearBuffers?.();
      queueLengthRef.current = 0;
    } catch {}
  }, []);

  useEffect(() => {
    resetState();
    const audioContext = new AudioContext({ sampleRate });
    const audioBufferQueue = audioContext.createBufferQueueSource();
    audioBufferQueue.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    audioBufferQueueRef.current = audioBufferQueue;

    return resetState;
  }, [resetState, sampleRate]);

  const playAudio = useCallback(() => {
    if (audioBufferQueueRef.current) {
      console.log(
        "Number of inputs and outputs: ",
        audioBufferQueueRef.current.numberOfInputs,
        audioBufferQueueRef.current.numberOfOutputs
      );

      audioBufferQueueRef.current.start();
      setIsAudioPlaying(true);
      audioBufferQueueRef.current.onEnded = (event) => {
        const { bufferId } = event;
        if (bufferId === lastBufferIdRef.current) {
          setIsAudioPlaying(false);
        }
      };
    }
  }, []);

  const enqueueAudioBufferQueue = useCallback((audioBuffer: AudioBuffer) => {
    queueLengthRef.current += 1;
    const bufferId = audioBufferQueueRef.current?.enqueueBuffer(audioBuffer);
    if (bufferId) {
      lastBufferIdRef.current = bufferId;
    }
  }, []);

  const logState = useCallback(() => {
    console.log(
      JSON.stringify(audioBufferQueueRef.current),
      audioBufferQueueRef.current?.numberOfInputs,
      audioBufferQueueRef.current?.numberOfOutputs
    );
  }, []);

  return {
    isAudioPlaying,
    enqueueAudioBufferQueue,
    stopPlayingAudio: resetState,
    playAudio,
    logState,
  };
};

export { useAudioBufferQueue };
