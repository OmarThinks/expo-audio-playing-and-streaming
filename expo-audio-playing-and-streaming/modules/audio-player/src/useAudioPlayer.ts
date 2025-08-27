import { useEffect, useState, useCallback } from 'react';
import AudioPlayerModule from './AudioPlayerModule';
import { UseAudioPlayerParams, UseAudioPlayerReturn, PlayAudioParams } from './AudioPlayer.types';

export function useAudioPlayer(params: UseAudioPlayerParams = {}): UseAudioPlayerReturn {
  const { onAudioStartsPlaying, onAudioStopsPlaying } = params;
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const startSubscription = AudioPlayerModule.addListener('onAudioStartsPlaying', () => {
      setIsAudioPlaying(true);
      onAudioStartsPlaying?.();
    });

    const stopSubscription = AudioPlayerModule.addListener('onAudioStopsPlaying', () => {
      setIsAudioPlaying(false);
      onAudioStopsPlaying?.();
    });

    return () => {
      startSubscription?.remove();
      stopSubscription?.remove();
    };
  }, [onAudioStartsPlaying, onAudioStopsPlaying]);

  const playAudio = useCallback(async (audioParams: PlayAudioParams) => {
    try {
      await AudioPlayerModule.playAudio(audioParams.base64Text, audioParams.sampleRate);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const stopPlayingAudio = useCallback(async () => {
    try {
      await AudioPlayerModule.stopPlayingAudio();
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, []);

  return {
    playAudio,
    stopPlayingAudio,
    isAudioPlaying,
  };
}
