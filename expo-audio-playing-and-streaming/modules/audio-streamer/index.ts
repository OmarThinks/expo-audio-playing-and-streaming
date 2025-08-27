// Reexport the native module. On web, it will be resolved to AudioStreamerModule.web.ts
// and on native platforms to AudioStreamerModule.ts
export * from "./src/AudioStreamer.types";
export { default } from "./src/AudioStreamerModule";
export { default as AudioStreamerView } from "./src/AudioStreamerView";
export { useAudioStream } from "./src/useAudioStream";
