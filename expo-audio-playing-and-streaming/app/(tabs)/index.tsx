import { useBase64AudioPlayer } from "@/hooks/useBase64AudioPlayer";
import { dummyBase64Text } from "@/samples/dummyBase64Text";
import React from "react";
import { Button, Text, View } from "react-native";

function Example() {
  const { isAudioPlaying, playAudio, stopPlayingAudio } =
    useBase64AudioPlayer();

  return (
    <View
      style={{
        alignSelf: "stretch",
        flex: 1,
        padding: 16,
        justifyContent: "center",
        alignItems: "stretch",
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "semibold" }}>
        Is Playing: {`${isAudioPlaying}`}
      </Text>

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

export default Example;
