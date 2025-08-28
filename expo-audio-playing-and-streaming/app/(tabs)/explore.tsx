import { useBase64AudioPlayer } from "@/hooks/useBase64AudioPlayer";
import { useAudioStream } from "@/modules/audio-streamer";
import { requestRecordingPermissionsAsync } from "expo-audio";
import React, { useCallback, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const streamModuleAudioDataToBase64 = (audioData: number[]): string => {
  // Convert to 16-bit PCM buffer
  const buffer = new ArrayBuffer(audioData.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < audioData.length; i++) {
    view.setInt16(i * 2, audioData[i], true); // little endian
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};

function mergePCMBase64Strings(pcmBase64List: string[]): string {
  if (pcmBase64List.length === 0) {
    return "";
  }

  if (pcmBase64List.length === 1) {
    return pcmBase64List[0];
  }

  // Convert all base64 strings to binary data
  const binaryDataArrays: Uint8Array[] = pcmBase64List.map((base64String) => {
    // Remove any data URL prefix if present (e.g., "data:audio/pcm;base64,")
    const cleanBase64 = base64String.replace(/^data:.*?;base64,/, "");

    // Decode base64 to binary
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  });

  // Calculate total length
  const totalLength = binaryDataArrays.reduce(
    (sum, array) => sum + array.length,
    0
  );

  // Create merged array
  const mergedArray = new Uint8Array(totalLength);
  let offset = 0;

  for (const array of binaryDataArrays) {
    mergedArray.set(array, offset);
    offset += array.length;
  }

  // Convert back to base64
  let binaryString = "";
  for (let i = 0; i < mergedArray.length; i++) {
    binaryString += String.fromCharCode(mergedArray[i]);
  }

  return btoa(binaryString);
}

const calculateVolumeFromStreamingModuleData = (
  audioData: number[]
): number => {
  if (audioData.length === 0) return 0;

  const sum = audioData.reduce((acc, sample) => acc + sample * sample, 0);
  const rms = Math.sqrt(sum / audioData.length);

  // Normalize to 0-100 range
  return Math.min(100, (rms / 32767) * 100);
};

function Example() {
  const [audioData, setAudioData] = useState<string[]>([]);
  const [lastDataReceived, setLastDataReceived] = useState<Date | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const [streamArray, setStreamArray] = useState<string[]>([]);
  const [volume, setVolume] = useState(0);

  const { playAudio, isAudioPlaying, stopPlayingAudio } =
    useBase64AudioPlayer();

  const playStreamArray = useCallback(() => {
    const mergedAudio = mergePCMBase64Strings(streamArray);
    //console.log("Playing merged audio:", mergedAudio);
    playAudio({ base64Text: mergedAudio, sampleRate: 16000 });
  }, [playAudio, streamArray]);

  const onStreamData = useCallback((data: number[]) => {
    const base64Audio = streamModuleAudioDataToBase64(data);
    setVolume(calculateVolumeFromStreamingModuleData(data));

    setAudioData([...base64Audio].slice(0, 50)); // Show only first 50 samples for display
    setLastDataReceived(new Date());
    setDataCount((prev) => prev + 1);
    setStreamArray((prev) => [...prev, base64Audio]);
  }, []);

  const onStartStreaming = useCallback(() => {
    console.log("Audio streaming started");
    setDataCount(0);
    setAudioData([]);
    setStreamArray([]);
  }, []);
  const onStopStreaming = useCallback(() => {
    setVolume(0);
  }, []);

  const { isStreaming, startStreaming, stopStreaming } = useAudioStream({
    interval: 250,
    sampleRate: 16000,
    onStreamData,
    onStartStreaming,
    onStopStreaming,
  });

  const handleStartStreaming = useCallback(async () => {
    try {
      const permissionResponse = await requestRecordingPermissionsAsync();

      if (permissionResponse.granted) {
        await startStreaming();
      } else {
        console.error("Audio recording permission denied");
      }
    } catch (error) {
      console.error("Failed to start streaming:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Failed to start streaming: " + errorMessage);
    }
  }, [startStreaming]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Stream Test</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isStreaming ? "Streaming" : "Stopped"}
        </Text>
        <Text style={styles.statusText}>
          Data packets received: {dataCount}
        </Text>
        {lastDataReceived && (
          <Text style={styles.statusText}>
            Last data: {lastDataReceived.toLocaleTimeString()}
          </Text>
        )}

        <Text style={styles.statusText}>Volume: {volume}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {!isStreaming ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartStreaming}
            disabled={isStreaming}
          >
            <Text style={styles.buttonText}>Start Streaming</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopStreaming}
            disabled={!isStreaming}
          >
            <Text style={styles.buttonText}>Stop Streaming</Text>
          </TouchableOpacity>
        )}
      </View>
      {streamArray.length > 0 && (
        <Button
          title={isAudioPlaying ? "Stop Stream" : "Play Stream"}
          onPress={isAudioPlaying ? stopPlayingAudio : playStreamArray}
        />
      )}

      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>Latest Audio Samples (first 50):</Text>
        <ScrollView style={styles.dataScroll} nestedScrollEnabled>
          <Text style={styles.dataText}>
            {audioData.length > 0 ? audioData.join(", ") : "No data yet..."}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 120,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  dataContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  dataScroll: {
    flex: 1,
    maxHeight: 200,
  },
  dataText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 16,
  },
});

export default Example;
