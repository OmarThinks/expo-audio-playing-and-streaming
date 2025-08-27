// Reexport the native module. On web, it will be resolved to AudioPlayerModule.web.ts
// and on native platforms to AudioPlayerModule.ts
export { default } from './src/AudioPlayerModule';
export { default as AudioPlayerView } from './src/AudioPlayerView';
export * from  './src/AudioPlayer.types';
export { useAudioPlayer } from './src/useAudioPlayer';
