import { dummyBase64Text } from "@/samples/dummyBase64Text";
import { useAudioPlayer } from "@/modules/audio-player";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { AudioContext } from "react-native-audio-api";

function TestAudioPlayerModule() {
  const { playAudio, stopPlayingAudio, isAudioPlaying } = useAudioPlayer({
    onAudioStartsPlaying: () => {
      console.log("Audio started playing");
      //Alert.alert("Audio Started", "Audio playback has started");
    },
    onAudioStopsPlaying: () => {
      console.log("Audio stopped playing");
      //Alert.alert("Audio Stopped", "Audio playback has stopped");
    },
  });

  const handleStopAudio = () => {
    stopPlayingAudio();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Player Test</Text>

      <Button
        title="Original example"
        onPress={async () => {
          const audioContext = new AudioContext();

          const audioBuffer = await fetch(
            "https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3"
          )
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));
          console.log(audioBuffer);

          const playerNode = audioContext.createBufferSource();
          playerNode.buffer = audioBuffer;

          playerNode.connect(audioContext.destination);
          playerNode.start(audioContext.currentTime);
          playerNode.stop(audioContext.currentTime + 10);
        }}
      />

      <Button
        title="Play dummy audio with rn-audio-api"
        onPress={() => {
          playBase64AudioText(dummyBase64Text, 16000);
        }}
      />

      <View style={styles.buttonContainer}>
        <Button
          title="Play Dummy base64 Audio"
          onPress={() => {
            playAudio({
              base64Text: dummyBase64Text,
              sampleRate: 16000,
            });
          }}
          disabled={isAudioPlaying}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Stop Audio"
          onPress={handleStopAudio}
          disabled={!isAudioPlaying}
        />
      </View>

      <Text style={styles.statusText}>
        Status: {isAudioPlaying ? "Playing" : "Stopped"}
      </Text>

      <Text style={styles.note}>
        Note: This test uses a sample empty WAV file. Replace
        SAMPLE_BASE64_AUDIO with your actual base64 audio data.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  buttonContainer: {
    marginVertical: 10,
    width: "80%",
  },
  statusText: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: "600",
    color: "#007AFF",
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 30,
    fontStyle: "italic",
  },
});

const playBase64AudioText = async (base64: string, sampleRate: number) => {
  const audioContext = new AudioContext();

  // Convert base64 to raw PCM data
  const arrayBuffer = base64AudioTextToArrayBuffer(base64);
  const pcmData = new Int16Array(arrayBuffer);

  // Create audio buffer with the specified sample rate
  const audioBuffer = audioContext.createBuffer(1, pcmData.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Convert Int16 PCM data to Float32 for Web Audio API
  for (let i = 0; i < pcmData.length; i++) {
    channelData[i] = pcmData[i] / 32768.0; // Normalize 16-bit to -1.0 to 1.0
  }

  const playerNode = audioContext.createBufferSource();
  playerNode.buffer = audioBuffer;

  playerNode.connect(audioContext.destination);
  playerNode.start(audioContext.currentTime);
  playerNode.stop(audioContext.currentTime + audioBuffer.duration);
};

function base64AudioTextToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export default TestAudioPlayerModule;
