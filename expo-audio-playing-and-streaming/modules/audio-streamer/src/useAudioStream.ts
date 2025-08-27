import { useEffect, useRef, useState } from "react";
import {
  UseAudioStreamOptions,
  UseAudioStreamReturn,
} from "./AudioStreamer.types";
import AudioStreamerModule from "./AudioStreamerModule";

export const useAudioStream = (
  options: UseAudioStreamOptions
): UseAudioStreamReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const subscriptionsRef = useRef<any[]>([]);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Subscribe to audio stream data events
    const dataSubscription = AudioStreamerModule.addListener(
      "onAudioStreamData",
      (event) => {
        optionsRef.current.onStreamData(event.data);
      }
    );

    // Subscribe to audio stream status events
    const statusSubscription = AudioStreamerModule.addListener(
      "onAudioStreamStatus",
      (event) => {
        setIsStreaming(event.isStreaming);
        if (event.isStreaming) {
          optionsRef.current.onStartStreaming();
        } else {
          optionsRef.current.onStopStreaming();
        }
      }
    );

    subscriptionsRef.current = [dataSubscription, statusSubscription];

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionsRef.current.forEach((sub) => sub.remove());
      subscriptionsRef.current = [];
    };
  }, []);

  const startStreaming = async (): Promise<void> => {
    try {
      await AudioStreamerModule.startAudioStream({
        sampleRate: options.sampleRate,
        interval: options.interval,
      });
    } catch (error) {
      console.error("Failed to start audio streaming:", error);
      throw error;
    }
  };

  const stopStreaming = async (): Promise<void> => {
    try {
      await AudioStreamerModule.stopAudioStream();
    } catch (error) {
      console.error("Failed to stop audio streaming:", error);
      throw error;
    }
  };

  return {
    isStreaming,
    startStreaming,
    stopStreaming,
  };
};
