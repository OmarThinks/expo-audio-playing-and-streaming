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

export default TestAudioPlayerModule;
