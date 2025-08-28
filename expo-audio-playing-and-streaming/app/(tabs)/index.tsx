import { useBase64PcmAudioPlayer } from "@/audioHooks/useBase64PcmAudioPlayer";
import { dummyBase64Text } from "@/samples/dummyBase64Text";
import React from "react";
import { Button, Text, View } from "react-native";

const Learn1 = () => {
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
