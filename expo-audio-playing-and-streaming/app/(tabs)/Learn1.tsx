import { dummyBase64Text } from "@/samples/dummyBase64Text";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import { AudioBufferSourceNode, AudioContext } from "react-native-audio-api";

const useBase64PcmAudioPlayer = ({ sampleRate }: { sampleRate: number }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferSourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const cleanUp = useCallback(() => {
    setIsAudioPlaying(false);

    try {
      audioBufferSourceNodeRef.current?.stop?.();
    } catch {}
    audioBufferSourceNodeRef.current = null;
  }, []);

  useEffect(() => {
    cleanUp();

    const audioContext = new AudioContext({ sampleRate });
    audioContextRef.current = audioContext;

    return () => {
      cleanUp();
    };
  }, [cleanUp, sampleRate]);

  const playPcmBase64Audio = useCallback(
    async ({ base64String }: { base64String: string }) => {
      if (audioContextRef.current) {
        const audioBuffer =
          await audioContextRef.current?.decodePCMInBase64Data(base64String);

        const audioBufferSourceNode =
          audioContextRef.current.createBufferSource();
        audioBufferSourceNode.connect(audioContextRef.current.destination);

        audioBufferSourceNode.buffer = audioBuffer;
        setIsAudioPlaying(true);
        audioBufferSourceNode.onEnded = () => {
          cleanUp();
        };
        audioBufferSourceNode.start();
        audioBufferSourceNodeRef.current = audioBufferSourceNode;
      }
    },
    [cleanUp]
  );

  return { isAudioPlaying, playPcmBase64Audio, stopPlayingAudio: cleanUp };
};

const Learn1 = () => {
  /*const myFunction = useCallback(async () => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodePCMInBase64Data(
      dummyBase64Text
    );
    const playerNode = audioContext.createBufferSource();
    playerNode.connect(audioContext.destination);
    playerNode.buffer = audioBuffer;
    playerNode.start();
  }, []);*/

  const { isAudioPlaying, playPcmBase64Audio, stopPlayingAudio } =
    useBase64PcmAudioPlayer({ sampleRate: 16000 });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "stretch",
        padding: 16,
      }}
    >
      <Text>Is Audio Playing: {`${isAudioPlaying}`}</Text>
      <Button
        title={isAudioPlaying ? "Stop" : "Play"}
        onPress={
          isAudioPlaying
            ? stopPlayingAudio
            : () => {
                playPcmBase64Audio({ base64String: dummyBase64Text });
              }
        }
      />
    </View>
  );
};

export default Learn1;
