import { useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { emit } from "@tauri-apps/api/event";
import {
  VideoControlCommand,
  VideoStateUpdate,
  VIDEO_CONTROL_EVENT,
  VIDEO_STATE_UPDATE_EVENT,
} from "@/types/video-control";

interface UseVideoSyncOptions {
  slideId: string;
  isActive: boolean; // Only sync when this slide is active
}

/**
 * Hook for audience view to sync video playback with presenter controls
 * Returns a ref to attach to the video element
 */
export const useVideoSync = ({ slideId, isActive }: UseVideoSyncOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stateUpdateIntervalRef = useRef<number | null>(null);

  // Send video state updates to presenter
  const sendStateUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    const buffered =
      video.buffered.length > 0
        ? (video.buffered.end(video.buffered.length - 1) / video.duration) * 100
        : 0;

    const state: VideoStateUpdate = {
      slideId,
      currentTime: video.currentTime,
      duration: video.duration || 0,
      paused: video.paused,
      volume: video.volume,
      loop: video.loop,
      playbackRate: video.playbackRate,
      buffered: isNaN(buffered) ? 0 : buffered,
      readyState: video.readyState,
      error: video.error ? video.error.message : null,
      seeking: video.seeking,
    };

    emit(VIDEO_STATE_UPDATE_EVENT, state).catch((error) => {
      console.error("Failed to emit video state update:", error);
    });
  }, [slideId, isActive]);

  // Handle video control commands from presenter
  useEffect(() => {
    if (!isActive) return;

    const unlisten = listen<VideoControlCommand>(
      VIDEO_CONTROL_EVENT,
      (event) => {
        const command = event.payload;
        const video = videoRef.current;

        // Only handle commands for this slide
        if (command.slideId !== slideId || !video) return;

        switch (command.action) {
          case "play":
            video.play().catch((error) => {
              console.error("Failed to play video:", error);
            });
            video.loop = true;
            break;
          case "pause":
            video.pause();
            video.loop = false;
            break;
          case "seek":
            if (command.value !== undefined) {
              video.currentTime = command.value;
            }
            break;
          case "volume":
            if (command.value !== undefined) {
              video.volume = Math.max(0, Math.min(1, command.value));
            }
            break;
          case "rate":
            if (command.value !== undefined) {
              video.playbackRate = command.value;
            }
            break;
        }

        // Send immediate state update after command
        sendStateUpdate();
      }
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [slideId, isActive, sendStateUpdate]);

  // Setup state update interval and video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive) return;

    // Set initial loop state to true (can be controlled dynamically via commands)
    video.loop = true;

    // Send state updates periodically while playing (every ~16ms for smooth 60fps updates)
    const startStateUpdates = () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
      stateUpdateIntervalRef.current = window.setInterval(sendStateUpdate, 16);
    };

    const stopStateUpdates = () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
        stateUpdateIntervalRef.current = null;
      }
    };

    // Event listeners
    const handlePlay = () => {
      startStateUpdates();
      sendStateUpdate();
    };

    const handlePlaying = () => {
      startStateUpdates();
      sendStateUpdate();
    };

    const handlePause = () => {
      stopStateUpdates();
      sendStateUpdate();
    };

    const handleSeeking = () => sendStateUpdate();
    const handleSeeked = () => sendStateUpdate();
    const handleVolumeChange = () => sendStateUpdate();
    const handleRateChange = () => sendStateUpdate();
    const handleLoadedMetadata = () => sendStateUpdate();
    const handleCanPlay = () => sendStateUpdate();
    const handleError = () => sendStateUpdate();

    video.addEventListener("play", handlePlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("ratechange", handleRateChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // Send initial state
    sendStateUpdate();

    // Start updates if video is already playing
    if (!video.paused) {
      startStateUpdates();
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("ratechange", handleRateChange);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      stopStateUpdates();
    };
  }, [isActive, sendStateUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stateUpdateIntervalRef.current) {
        clearInterval(stateUpdateIntervalRef.current);
      }
    };
  }, []);

  return videoRef;
};
