import { useEffect, useState, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import {
  VideoControlCommand,
  VideoStateUpdate,
  VideoReadyPayload,
  VideoAckPayload,
  VIDEO_CONTROL_EVENT,
  VIDEO_STATE_UPDATE_EVENT,
  VIDEO_READY_EVENT,
  VIDEO_ACK_EVENT,
} from "@/types/video-control";

interface UseVideoStateOptions {
  slideId: string | null; // null when no slide is active
}

export type HandshakeState = "idle" | "pending" | "acknowledged" | "failed";

/**
 * Hook for presenter view to control video playback and receive state updates
 */
export const useVideoState = ({ slideId }: UseVideoStateOptions) => {
  const [videoState, setVideoState] = useState<VideoStateUpdate | null>(null);
  const [handshakeState, setHandshakeState] = useState<HandshakeState>("idle");
  const timeoutRef = useRef<number | null>(null);

  // Listen for video state updates from audience view
  useEffect(() => {
    if (!slideId) return;

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

  // Listen for video ready signal from audience (handshake)
  useEffect(() => {
    if (!slideId) return;

    console.log("Setting up VIDEO_READY_EVENT listener for slide:", slideId);

    const unlisten = listen<VideoReadyPayload>(VIDEO_READY_EVENT, (event) => {
      const payload = event.payload;

      console.log("Received VIDEO_READY_EVENT", {
        payload,
        currentSlideId: slideId,
      });

      // Only handle ready signals for this slide and background videos
      if (payload.slideId !== slideId || payload.videoType !== "background") {
        console.log("Ignoring ready signal - slideId or videoType mismatch");
        return;
      }

      console.log("Received video ready signal from audience - acknowledging");
      setHandshakeState("acknowledged");

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Send acknowledgment back to audience
      const ackPayload: VideoAckPayload = {
        slideId: payload.slideId,
      };

      emit(VIDEO_ACK_EVENT, ackPayload).catch((error) => {
        console.error("Failed to emit video acknowledgment:", error);
      });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [slideId]);

  // Clear state and reset handshake when slide changes
  useEffect(() => {
    if (!slideId) {
      console.log("No slideId - resetting handshake state");
      setVideoState(null);
      setHandshakeState("idle");

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Set to pending when a new slide with video becomes active
      console.log("Setting handshake to pending for slide:", slideId);
      setHandshakeState("pending");

      // Set timeout for handshake failure (5 seconds)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      console.log("Starting 5s handshake timeout for slide:", slideId);
      timeoutRef.current = window.setTimeout(() => {
        setHandshakeState((current) => {
          // Only set to failed if still pending
          if (current === "pending") {
            console.warn(
              "Video handshake timeout - no ready signal received for slide:",
              slideId
            );
            return "failed";
          }
          console.log("Handshake timeout fired but state is already:", current);
          return current;
        });
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [slideId]);

  // Send control command to audience view
  const sendCommand = (
    action: VideoControlCommand["action"],
    value?: number
  ) => {
    if (!slideId) return;

    const command: VideoControlCommand = {
      slideId,
      action,
      value,
    };

    emit(VIDEO_CONTROL_EVENT, command).catch((error) => {
      console.error("Failed to emit video control command:", error);
    });
  };

  // Control methods
  const play = () => {
    sendCommand("play");
  };

  const pause = () => {
    sendCommand("pause");
  };

  const togglePlayPause = () => {
    if (videoState?.paused) {
      play();
    } else {
      pause();
    }
  };

  const seek = (time: number) => {
    sendCommand("seek", time);
  };

  const skipForward = (seconds: number = 10) => {
    if (videoState) {
      const newTime = Math.min(
        videoState.currentTime + seconds,
        videoState.duration
      );
      seek(newTime);
    }
  };

  const skipBackward = (seconds: number = 10) => {
    if (videoState) {
      const newTime = Math.max(videoState.currentTime - seconds, 0);
      seek(newTime);
    }
  };

  const setVolume = (volume: number) => {
    sendCommand("volume", volume);
  };

  const setPlaybackRate = (rate: number) => {
    sendCommand("rate", rate);
  };

  // Retry handshake by re-emitting acknowledgment
  const retryHandshake = () => {
    if (!slideId) return;

    console.log("Retrying video handshake");
    setHandshakeState("pending");

    // Set new timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setHandshakeState((current) => {
        if (current === "pending") {
          console.warn("Video handshake retry timeout");
          return "failed";
        }
        return current;
      });
    }, 5000);

    // Re-emit acknowledgment in case audience is ready
    const ackPayload: VideoAckPayload = {
      slideId,
    };

    emit(VIDEO_ACK_EVENT, ackPayload).catch((error) => {
      console.error("Failed to emit video acknowledgment:", error);
      setHandshakeState("failed");
    });
  };

  return {
    videoState,
    handshakeState,
    play,
    pause,
    togglePlayPause,
    seek,
    skipForward,
    skipBackward,
    setVolume,
    setPlaybackRate,
    retryHandshake,
  };
};
