import { useEffect, useState, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import {
  VideoControlCommand,
  VideoStateUpdate,
  VIDEO_CONTROL_EVENT,
  VIDEO_STATE_UPDATE_EVENT,
} from "@/types/video-control";

interface UseVideoStateOptions {
  slideId: string | null; // null when no slide is active
}

/**
 * Hook for presenter view to control video playback and receive state updates
 */
export const useVideoState = ({ slideId }: UseVideoStateOptions) => {
  const [videoState, setVideoState] = useState<VideoStateUpdate | null>(null);

  // Listen for video state updates from audience view
  useEffect(() => {
    const unlisten = listen<VideoStateUpdate>(
      VIDEO_STATE_UPDATE_EVENT,
      (event) => {
        const state = event.payload;

        // Only update state for the currently active slide
        if (slideId && state.slideId === slideId) {
          setVideoState(state);
        }
      }
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [slideId]);

  // Clear state when slide changes
  useEffect(() => {
    if (!slideId) {
      setVideoState(null);
    }
  }, [slideId]);

  // Send control command to audience view
  const sendCommand = useCallback(
    (action: VideoControlCommand["action"], value?: number) => {
      if (!slideId) return;

      const command: VideoControlCommand = {
        slideId,
        action,
        value,
      };

      emit(VIDEO_CONTROL_EVENT, command).catch((error) => {
        console.error("Failed to emit video control command:", error);
      });
    },
    [slideId]
  );

  // Control methods
  const play = useCallback(() => {
    sendCommand("play");
  }, [sendCommand]);

  const pause = useCallback(() => {
    sendCommand("pause");
  }, [sendCommand]);

  const togglePlayPause = useCallback(() => {
    if (videoState?.paused) {
      play();
    } else {
      pause();
    }
  }, [videoState, play, pause]);

  const seek = useCallback(
    (time: number) => {
      sendCommand("seek", time);
    },
    [sendCommand]
  );

  const skipForward = useCallback(
    (seconds: number = 10) => {
      if (videoState) {
        const newTime = Math.min(
          videoState.currentTime + seconds,
          videoState.duration
        );
        seek(newTime);
      }
    },
    [videoState, seek]
  );

  const skipBackward = useCallback(
    (seconds: number = 10) => {
      if (videoState) {
        const newTime = Math.max(videoState.currentTime - seconds, 0);
        seek(newTime);
      }
    },
    [videoState, seek]
  );

  const setVolume = useCallback(
    (volume: number) => {
      sendCommand("volume", volume);
    },
    [sendCommand]
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      sendCommand("rate", rate);
    },
    [sendCommand]
  );

  return {
    videoState,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    setPlaybackRate,
  };
};
