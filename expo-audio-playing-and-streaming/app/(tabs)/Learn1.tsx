import { View, Text, Button } from "react-native";
import React, { useCallback } from "react";
import { dummyBase64Text } from "@/samples/dummyBase64Text";
import { Buffer } from "buffer";
import {
  AudioBuffer,
  AudioContext,
  AudioBufferSourceNode,
} from "react-native-audio-api";

const Learn1 = () => {
  const myFunction = useCallback(async () => {
    const arrayBuffer = Buffer.from(dummyBase64Text, "base64").buffer;

    const audioContext = new AudioContext();

    const audioBuffer = await audioContext.decodePCMInBase64Data(
      dummyBase64Text
    );

    const playerNode = audioContext.createBufferSource();

    playerNode.connect(audioContext.destination);

    playerNode.buffer = audioBuffer;

    playerNode.start();
  }, []);

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
      <Text>Learn1</Text>
      <Button title="Press me" onPress={myFunction} />
    </View>
  );
};

export default Learn1;
