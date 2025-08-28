import { base64AudioTextToArrayBuffer } from "@/utils/audioUtils";
import { useCallback, useRef, useState } from "react";
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

export { useBase64AudioPlayer };
